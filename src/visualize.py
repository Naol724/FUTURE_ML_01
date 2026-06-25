import matplotlib.pyplot as plt
import pandas as pd

def plot_and_save_forecast(test_set, y_pred, output_path='../outputs/charts/forecast_vs_actual.png'):
    """Generates daily aggregated charts and saves them to outputs."""
    test_results = test_set.copy()
    test_results['predicted_sales'] = y_pred

    daily_actual = test_results.groupby('date')['sales'].sum()
    daily_pred = test_results.groupby('date')['predicted_sales'].sum()

    plt.figure(figsize=(14, 6))
    plt.plot(daily_actual.index, daily_actual.values, label='Actual Sales', color='blue', alpha=0.7)
    plt.plot(daily_pred.index, daily_pred.values, label='Forecasted Sales', color='orange', linestyle='--', alpha=0.9)

    plt.title('Store Sales Forecast vs Actual Demands (Production Pipeline)')
    plt.xlabel('Date')
    plt.ylabel('Total Daily Sales')
    plt.legend()
    plt.tight_layout()
    
    # Save chart asset
    plt.savefig(output_path)
    plt.close()
    print(f"Production visualization saved successfully to: {output_path}")