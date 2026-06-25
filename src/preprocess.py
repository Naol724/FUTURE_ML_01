import pandas as pd

def load_and_preprocess_data(filepath):
    """Loads the store sales data and processes dates."""
    # Load data
    df = pd.read_csv(filepath)
    
    # Process dates
    df['date'] = pd.to_datetime(df['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['dayofweek'] = df['date'].dt.dayofweek
    
    return df