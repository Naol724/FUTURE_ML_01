import pandas as pd

def split_features_and_target(df, split_date='2017-06-01'):
    """Splits data chronologically into train and test features/targets."""
    # Split chronologically
    train_set = df[df['date'] < split_date]
    test_set = df[df['date'] >= split_date]
    
    # Define features
    feature_cols = ['store_nbr', 'onpromotion', 'year', 'month', 'dayofweek']
    
    X_train = train_set[feature_cols]
    y_train = train_set['sales']
    X_test = test_set[feature_cols]
    y_test = test_set['sales']
    
    return X_train, y_train, X_test, y_test, test_set