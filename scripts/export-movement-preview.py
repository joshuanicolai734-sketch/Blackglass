"""Export three website studies from the exact Blackglass 88.2 S3D packs.

Usage: python scripts/export-movement-preview.py /absolute/path/to/88.2.apk
Requires ffmpeg; uses only Python's standard library. No signing material.
"""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import zipfile

APK_SHA256 = "307d56afef53c241bda2a583f1282df4d9385067a2163492807297aaaaf7ddbc"
STUDIES = {"back-squat": "back_squat__barbell", "deadlift": "deadlift__barbell", "push-up": "pushup__bodyweight"}


def run(args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def main():
    apk = Path(sys.argv[1])
    if hashlib.sha256(apk.read_bytes()).hexdigest() != APK_SHA256:
        raise ValueError("Expected the verified 88.2 Movement 3D APK")
    target = Path(__file__).resolve().parents[1] / "public" / "movements"
    target.mkdir(parents=True, exist_ok=True)
    manifest = {"source_apk_sha256": APK_SHA256, "source_version": "88.2-motion", "kind": "authored movement artwork, not an Android screen recording", "duration_seconds": 4, "output": []}
    with zipfile.ZipFile(apk) as archive, tempfile.TemporaryDirectory() as temporary:
        frames = Path(temporary)
        for slug, asset in STUDIES.items():
            for view, suffix in [("angled", ""), ("front", "@FRONT")]:
                path = f"assets/studio3d/{asset}{suffix}.s3d"
                data = archive.read(path)
                count, width, height, flags = struct.unpack_from(">IIII", data, 4)
                if data[:4] != b"S3D3" or (count, width, height, flags) != (64, 1000, 765, 7):
                    raise ValueError(f"Unexpected source layout: {path}")
                phases = struct.unpack_from(f">{count}f", data, 20 + 8 * count)
                if any(abs(phase - i / count) > 1e-6 for i, phase in enumerate(phases)):
                    raise ValueError(f"Expected uniformly sampled phases: {path}")
                cursor = 20 + 20 * count
                for i in range(count):
                    offset, length = struct.unpack_from(">II", data, 20 + 8 * i)
                    payload = data[offset:offset + length]
                    if offset != cursor or len(payload) != length or payload[:4] != b"RIFF" or payload[8:12] != b"WEBP":
                        raise ValueError(f"Invalid frame {i}: {path}")
                    (frames / f"{i:02}.webp").write_bytes(payload)
                    cursor += length
                if cursor != len(data):
                    raise ValueError(f"Trailing bytes: {path}")
                stem = f"{slug}-{view}"
                run(["-framerate", "16", "-i", str(frames / "%02d.webp"), "-vf", "scale=768:588:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", "-threads", "2", str(target / f"{stem}.mp4")])
                run(["-i", str(frames / "00.webp"), "-vf", "scale=768:588:flags=lanczos", "-c:v", "libwebp", "-quality", "82", "-frames:v", "1", "-threads", "2", str(target / f"{stem}.webp")])
                if slug == "back-squat" and view == "angled":
                    run(["-i", str(frames / "32.webp"), "-vf", "scale=480:368:flags=lanczos", "-c:v", "libwebp", "-quality", "82", "-frames:v", "1", "-threads", "2", str(target / "back-squat-cover.webp")])
                    cover = target / "back-squat-cover.webp"
                    manifest["output"].append({"file": cover.name, "source_pack": path, "source_frame": 32, "source_pack_sha256": hashlib.sha256(data).hexdigest(), "bytes": cover.stat().st_size, "sha256": hashlib.sha256(cover.read_bytes()).hexdigest()})
                for extension in ["mp4", "webp"]:
                    output = target / f"{stem}.{extension}"
                    manifest["output"].append({"file": output.name, "source_pack": path, "source_pack_sha256": hashlib.sha256(data).hexdigest(), "bytes": output.stat().st_size, "sha256": hashlib.sha256(output.read_bytes()).hexdigest()})
                print(f"Exported {stem}")
    (target / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main()
