# gee_pipeline/auth.py
import ee
import os

def initialize_gee():
    # For production use service account
    # For local testing you can temporarily keep ee.Authenticate()
    ee.Initialize(project="ricevision")
