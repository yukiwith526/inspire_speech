try:
    import fastapi

    print("✓ FastAPI is installed")
except ImportError:
    print("✗ FastAPI is not installed")

try:
    import uvicorn

    print("✓ Uvicorn is installed")
except ImportError:
    print("✗ Uvicorn is not installed")

try:
    from openai import OpenAI

    print("✓ OpenAI client is installed")
except ImportError:
    print("✗ OpenAI client is not installed")

try:
    from dotenv import load_dotenv

    print("✓ python-dotenv is installed")
except ImportError:
    print("✗ python-dotenv is not installed")

print("\nTo install missing packages, run:")
print("pip install fastapi uvicorn openai python-dotenv")
