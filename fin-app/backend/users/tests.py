# from django.test import TestCase
import pandas as pd

# Create your tests here.
taxTable = {
    "2024":[
        {"category": "A", "min": 0, "max": 5000, "rate": 0, "fixed_tax": 0},
        {"category": "B", "min": 5001, "max": 20000, "rate": 1, "fixed_tax": 0},
        {"category": "C", "min": 20001, "max": 35000, "rate": 3, "fixed_tax": 150},
        {"category": "D", "min": 35001, "max": 50000, "rate": 6, "fixed_tax": 600},
        {"category": "E", "min": 50001, "max": 70000, "rate": 11, "fixed_tax": 1500},
        {"category": "F", "min": 70001, "max": 100000, "rate": 19, "fixed_tax": 3700},
        {"category": "G", "min": 100001, "max": 400000, "rate": 25, "fixed_tax": 9400},
        {"category": "H", "min": 400001, "max": 600000, "rate": 26, "fixed_tax": 84400},
        {"category": "I", "min": 600001, "max": 2000000, "rate": 28, "fixed_tax": 136400},
        {"category": "J", "min": 2000001, "max": float('inf'), "rate": 30, "fixed_tax": 528400},
    ]
}

def calculateTax(income):
    for yr in taxTable:
        yearTax = taxTable[yr]
        for rows in yearTax:
            if income >= rows["min"]:
                taxableIncome = income - (rows["min"]-1)
                tax = rows["fixed_tax"] + taxableIncome*(rows["rate"]/100)
                category = rows["category"]
            else:
                break
    if taxableIncome <= 35000:
        tax -= 400
    
    return tax, taxableIncome, category

print(calculateTax(34240))

