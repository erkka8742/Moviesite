import requests
from bs4 import BeautifulSoup

def scrape_text(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        elements = soup.select('h4.no-top-margin.event-name.one-line a')

        for element in elements:
            print(element.get_text())

    except Exception as e:
        print(f"An error occurred: {e}")

scrape_text('https://www.finnkino.fi/en/top-10-elokuvat/')
