import importlib.util
import io
import json
import unittest
from unittest.mock import patch
from pathlib import Path

spec = importlib.util.spec_from_file_location("fm_server", Path(__file__).resolve().parents[1] / "fm_server.py")
fm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fm)


class FrequencyTests(unittest.TestCase):
    def test_boundaries(self):
        self.assertEqual(fm.parse_frequency("87.5"), 87.5)
        self.assertEqual(fm.parse_frequency("108"), 108.0)
        self.assertEqual(fm.parse_frequency("99.54"), 99.5)

    def test_rejects_invalid_input(self):
        for value in (None, "", "nan", "inf", "0", "108.1", "87.4", "99;rm -rf /"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                fm.parse_frequency(value)

    def test_receiver_dependencies(self):
        with patch.object(fm.shutil, "which", side_effect=[None, "/usr/bin/ffmpeg"]):
            self.assertFalse(fm.receiver_available())
        with patch.object(fm.shutil, "which", side_effect=["/usr/bin/rtl_fm", "/usr/bin/ffmpeg"]):
            self.assertTrue(fm.receiver_available())

    def test_local_only_bind(self):
        # Regression guard: never expose the hardware control API on LAN.
        source = (Path(__file__).resolve().parents[1] / "fm_server.py").read_text()
        self.assertIn('("127.0.0.1", args.port)', source)
        self.assertNotIn('shell=True,', source)


if __name__ == "__main__":
    unittest.main()
