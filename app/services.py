import requests

def fetch_currency_data():
    url = "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,EUR-USD,BRL-USD,BRL-EUR,USD-EUR"
    response = requests.get(url)
    return response.json()