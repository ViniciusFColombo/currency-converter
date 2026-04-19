import requests


def fetch_currency_data():
    url = "https://economia.awesomeapi.com.br/last/EUR-BRL,USD-BRL"
    response = requests.get(url)
    return response.json()