import os
import sys
import tempfile
from pathlib import Path

import pytest

# Isolate tests from the developer's DB, exports and API key *before* the app is imported.
_tmp = Path(tempfile.mkdtemp(prefix="reelixx_test_"))
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp / 'test.db'}"
os.environ["REELIXX_EXPORT_DIR"] = str(_tmp / "exports")
os.environ["REELIXX_FREE_MODE"] = "1"
os.environ["OPENAI_API_KEY"] = ""
os.environ.pop("AWS_ACCESS_KEY_ID", None)

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(scope="session")
def export_dir() -> Path:
    return _tmp / "exports"
