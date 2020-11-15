import google_streetview.api
from dotenv import load_dotenv
import os

load_dotenv()
# https://rrwen.github.io/google_streetview/
# Define parameters for street view api
API_KEY = os.getenv("STREET_VIEW_API_KEY")
params = [{
	'size': '600x300', # max 640x640 pixels
	'location': '42.728886,-73.677793',
	'heading': '151.78',
	'pitch': '-0.76',
	'key': API_KEY
}]

# Create a results object
results = google_streetview.api.results(params)

# Download images to directory 'downloads'
results.download_links('downloads')
