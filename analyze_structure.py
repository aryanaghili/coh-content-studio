import pandas as pd
from docx import Document
import sys

def analyze():
    print("--- DOCX Structure ---")
    doc = Document('/Users/aryanaghili/Downloads/GOLIVEA Project Intake Review System AA v2.0.docx')
    for p in doc.paragraphs[:20]:
        if p.text.strip():
            print(p.text)
            
    print("\n--- XLSX Structure ---")
    xl = pd.ExcelFile('/Users/aryanaghili/Downloads/GOLIVEA Weekly Operating Calibration Hub v3.0.xlsx')
    for sheet in xl.sheet_names:
        print(f"\nSheet: {sheet}")
        df = xl.parse(sheet)
        print("Columns:", list(df.columns))
        print("First row data:", df.head(1).to_dict('records'))

if __name__ == "__main__":
    analyze()
