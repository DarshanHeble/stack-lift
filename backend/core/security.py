"""Encryption utilities for integration credentials using Fernet symmetric encryption."""

from cryptography.fernet import Fernet
from backend.core.config import settings


class CredentialCrypto:
    """Manages secure encryption and in-memory decryption of API keys and PATs."""

    def __init__(self, key: str = settings.FERNET_KEY):
        # Ensure key is valid Fernet bytes
        try:
            self._cipher = Fernet(key.encode() if isinstance(key, str) else key)
        except Exception:
            # Fallback for dev if mock key provided
            dev_key = Fernet.generate_key()
            self._cipher = Fernet(dev_key)

    def encrypt(self, plain_text: str) -> bytes:
        """Encrypts sensitive plaintext into cipher bytes."""
        if not plain_text:
            return b""
        return self._cipher.encrypt(plain_text.encode("utf-8"))

    def decrypt(self, cipher_bytes: bytes) -> str:
        """Decrypts cipher bytes back to plaintext strictly in-memory."""
        if not cipher_bytes:
            return ""
        return self._cipher.decrypt(cipher_bytes).decode("utf-8")


crypto = CredentialCrypto()
