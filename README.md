# 📈 Sales & Demand Forecasting for Businesses

> **Future Interns — Machine Learning Internship | Task 1**
> Repository: `FUTURE_ML_01`

---

## 📌 Project Overview

This project builds a machine learning model that forecasts future **sales or demand** using historical business data. The goal is to help businesses make data-driven decisions by predicting upcoming trends — enabling smarter inventory management, staffing, and financial planning.

---

## 🎯 Objectives

- Clean and prepare time-series business data for ML modeling
- Engineer time-based features (lag, rolling averages, seasonality indicators)
- Train and evaluate forecasting models using regression or time-series methods
- Visualize forecasts in a clear, business-friendly format
- Provide actionable insights from model outputs

---

## 🗂️ Project Structure

```
FUTURE_ML_01/
│
├── data/
│   ├── raw/                  # Original, unmodified dataset
│   └── processed/            # Cleaned and feature-engineered data
│
├── notebooks/
│   ├── 01_EDA.ipynb          # Exploratory Data Analysis
│   ├── 02_preprocessing.ipynb # Data cleaning & feature engineering
│   ├── 03_modeling.ipynb     # Model training & evaluation
│   └── 04_forecasting.ipynb  # Final forecast generation & visualization
│
├── src/
│   ├── preprocess.py         # Data cleaning utilities
│   ├── features.py           # Feature engineering functions
│   ├── model.py              # Model training & prediction logic
│   └── visualize.py          # Plotting and visualization helpers
│
├── outputs/
│   ├── forecasts/            # Generated forecast CSV files
│   └── charts/               # Saved visualization images
│
├── requirements.txt          # Python dependencies
└── README.md
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Python 3.9+ | Core programming language |
| Jupyter Notebook | Experimentation and presentation |
| Pandas | Data manipulation |
| NumPy | Numerical operations |
| Scikit-learn | ML models (Linear Regression, Random Forest, etc.) |
| Matplotlib | Core plotting |
| Seaborn | Statistical visualizations |
| Statsmodels | ARIMA / SARIMA time-series models |
| Prophet *(optional)* | Facebook's forecasting library |
| Power BI / Tableau *(optional)* | Business dashboard visualization |

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/FUTURE_ML_01.git
cd FUTURE_ML_01
```

### 2. Create a Virtual Environment

```bash
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. requirements.txt

```
pandas==2.1.0
numpy==1.25.2
scikit-learn==1.3.0
matplotlib==3.7.2
seaborn==0.12.2
statsmodels==0.14.0
prophet==1.1.4
jupyter==1.0.0
openpyxl==3.1.2
```

---

## 📊 Dataset

### Option A — Use a Public Dataset (Recommended for internship)

- **Kaggle Store Sales — Time Series Forecasting**
  👉 https://www.kaggle.com/competitions/store-sales-time-series-forecasting
- **Rossmann Store Sales**
  👉 https://www.kaggle.com/competitions/rossmann-store-sales
- **M5 Forecasting Accuracy**
  👉 https://www.kaggle.com/competitions/m5-forecasting-accuracy

### Option B — Use Your Own CSV

Place your CSV file in `data/raw/`. The expected format is:

| date | product_id | sales | store_id |
|------|------------|-------|----------|
| 2023-01-01 | A001 | 150 | S01 |
| 2023-01-02 | A001 | 142 | S01 |

> ⚠️ The date column must be parseable by `pd.to_datetime()`.

---

## 🔄 How to Run

### Step 1 — Exploratory Data Analysis
```bash
jupyter notebook notebooks/01_EDA.ipynb
```
Understand the data: distributions, missing values, trends, seasonality, and outliers.

### Step 2 — Data Preprocessing
```bash
jupyter notebook notebooks/02_preprocessing.ipynb
```
- Handle missing values
- Parse and sort date columns
- Encode categorical features
- Split into train/test sets

### Step 3 — Feature Engineering
Key features to create:
```python
df['month'] = df['date'].dt.month
df['day_of_week'] = df['date'].dt.dayofweek
df['week_of_year'] = df['date'].dt.isocalendar().week
df['lag_1'] = df['sales'].shift(1)
df['rolling_mean_7'] = df['sales'].rolling(window=7).mean()
df['rolling_std_7'] = df['sales'].rolling(window=7).std()
```

### Step 4 — Model Training
```bash
jupyter notebook notebooks/03_modeling.ipynb
```

Recommended models to try (in order of complexity):

1. **Linear Regression** — baseline
2. **Random Forest Regressor** — handles non-linearity
3. **XGBoost / LightGBM** — high performance on tabular data
4. **ARIMA / SARIMA** — classic time-series
5. **Prophet** — handles seasonality and holidays automatically

```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"MAE: {mae:.2f} | RMSE: {rmse:.2f}")
```

### Step 5 — Forecast & Visualize
```bash
jupyter notebook notebooks/04_forecasting.ipynb
```

```python
import matplotlib.pyplot as plt

plt.figure(figsize=(14, 5))
plt.plot(y_test.values, label='Actual Sales', color='blue')
plt.plot(y_pred, label='Forecasted Sales', color='orange', linestyle='--')
plt.title('Sales Forecast vs Actual')
plt.xlabel('Time')
plt.ylabel('Sales')
plt.legend()
plt.tight_layout()
plt.savefig('outputs/charts/forecast_vs_actual.png')
plt.show()
```

---

## 📏 Model Evaluation Metrics

| Metric | Description |
|--------|-------------|
| **MAE** | Mean Absolute Error — average absolute difference |
| **RMSE** | Root Mean Squared Error — penalizes large errors |
| **MAPE** | Mean Absolute Percentage Error — percentage accuracy |
| **R² Score** | Goodness of fit (1.0 = perfect) |

```python
from sklearn.metrics import r2_score

mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
r2 = r2_score(y_test, y_pred)
print(f"MAPE: {mape:.2f}% | R²: {r2:.4f}")
```

---

## 💡 Key Features Implemented

- [x] Data cleaning & handling missing values
- [x] Time-based feature engineering (lag, rolling, seasonality)
- [x] Multiple model comparison
- [x] Model evaluation with MAE, RMSE, MAPE, R²
- [x] Business-friendly forecast visualizations
- [x] Forecast export to CSV for reporting

---

## 📤 Deliverable

A fully functional **sales forecast model** that:
- Accepts historical sales data as input
- Predicts future demand for a configurable time horizon
- Outputs clear visual charts comparing actual vs. predicted
- Provides error metrics and business interpretation

---

## 🏆 Skills Gained

- Time-series analysis and feature engineering
- Regression and forecasting model development
- Model evaluation and error analysis
- Data visualization for business audiences
- End-to-end ML pipeline construction

---

## 🔗 Internship Details

| Field | Info |
|-------|------|
| **Organization** | Future Interns |
| **Track** | Machine Learning (ML) |
| **Task Number** | 01 |
| **Repository Format** | `FUTURE_ML_01` |
| **Submission** | Via official Future Interns Task Portal (CIN ID required) |
| **LinkedIn** | [Future Interns](https://www.linkedin.com/company/future-interns/) |
| **Website** | [futureinterns.com](https://futureinterns.com) |
| **Email** | contact@futureinterns.com |

---

## 👤 Author

**Naol Gonfa (Nileget)**
- GitHub: [@Naol724](https://github.com/Naol724)
- Website: [naol.online](https://naol.online)
- Telegram: [@nilegt_](https://t.me/nilegt_)

---

> *"Consistency builds mastery."*
