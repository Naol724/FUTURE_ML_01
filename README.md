---

# 📈 Sales & Demand Forecasting for Businesses

> **Future Interns — Machine Learning Internship | Task 1** > Repository: `FUTURE_ML_01`

---

## 📌 Project Overview

This project implements an end-to-end Machine Learning production pipeline that forecasts future **sales and demand** using historical business trends. By moving from initial exploratory analysis to a modular production structure, this repository delivers accurate forecasts designed to assist businesses with optimized inventory management, proactive staffing, and strategic financial planning.

---

## 🎯 Objectives

* Clean, structure, and preprocess historical time-series data for scalable modeling.
* Engineer advanced temporal features (including calendar attributes and rolling windows) to eliminate training data leakage.
* Implement a strict chronological time-based split strategy ensuring precise out-of-time evaluation.
* Train, test, and evaluate predictive accuracy using an ensemble **Random Forest Regressor**.
* Deliver automated business-ready assets including visualization charts and forecast data spreadsheets.

---

## 🗂️ Project Structure

```
FUTURE_ML_01/
│
├── data/
│   ├── raw/                  # Original, unmodified Kaggle dataset (train.csv)
│   └── processed/            # Cleaned and feature-engineered data
│
├── notebooks/
│   ├── 01_EDA.ipynb          # Exploratory Data Analysis & initial visualization
│   ├── 02_preprocessing.ipynb # Experimental feature and engineering setups
│   └── 03_modeling.ipynb     # High-level pipeline testing and evaluation execution
│
├── src/                      # Production-Ready Modular Engine
│   ├── preprocess.py         # Automated data loading and date parsing engines
│   ├── features.py           # Chronological time-series splitting utilities
│   ├── model.py              # Machine Learning modeling, training, and evaluation metrics
│   └── visualize.py          # Production plotting and visualization export scripts
│
├── outputs/
│   ├── forecasts/            # Generated business-ready forecast spreadsheets (CSV)
│   └── charts/               # Saved high-resolution evaluation charts
│
├── requirements.txt          # Explicit Python dependencies
└── README.md

```

---

## 🛠️ Tech Stack

| Tool / Library | Purpose |
| --- | --- |
| **Python 3.9+** | Core programming language environment |
| **Jupyter Notebook** | Interactive exploration and prototyping |
| **Pandas** | High-performance data manipulation and aggregation |
| **NumPy** | Advanced multi-dimensional numerical operations |
| **Scikit-learn** | Production ML algorithms (Random Forest Regressor) and metrics |
| **Matplotlib / Seaborn** | Statistical visualizations and automated forecast rendering |

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Naol724/FUTURE_ML_01.git
cd FUTURE_ML_01

```

### 2. Create and Activate a Virtual Environment

```bash
# Initialize the environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate

```

### 3. Install Pinpoint Dependencies

```bash
pip install -r requirements.txt

```

---

## 📊 Dataset Ingestion

This implementation utilizes the official **Kaggle Store Sales — Time Series Forecasting** dataset.

* Place the source data file directly inside the raw directory path: `data/raw/train.csv`
* Columns expected and parsed include: `date`, `store_nbr`, `onpromotion`, and the target variable `sales`.

---

## 🔄 Execution & Production Pipeline

The architecture transitions smoothly from interactive experimentation to a fully modularized production pipeline script.

### Running the End-to-End Pipeline

To run data preprocessing, train the model, compute performance metrics, and export all deliverables simultaneously, execute this single routine inside your notebook or main script:

```python
import sys
sys.path.append('../src')

from preprocess import load_and_preprocess_data
from features import split_features_and_target
from model import train_random_forest, evaluate_predictions
from visualize import plot_and_save_forecast

# 1. Ingest & Preprocess
df_clean = load_and_preprocess_data("../data/raw/train.csv")
X_train, y_train, X_test, y_test, test_subset = split_features_and_target(df_clean)

# 2. Train Ensemble Model & Generate Predictions
trained_model = train_random_forest(X_train, y_train)
predictions = trained_model.predict(X_test)

# 3. Compute Metrics and Save Deliverable Charts
evaluate_predictions(y_test, predictions)
plot_and_save_forecast(test_subset, predictions)

```

---

## 📏 Model Evaluation Metrics

The predictive model is strictly benchmarked using business-standard regression metrics to guarantee out-of-sample consistency:

| Metric | Business Description | Implementation |
| --- | --- | --- |
| **MAE** | **Mean Absolute Error** — Average absolute units missed per prediction | `mean_absolute_error(y_test, y_pred)` |
| **RMSE** | **Root Mean Squared Error** — Error metric that penalizes larger misses heavily | `np.sqrt(mean_squared_error(y_test, y_pred))` |
| **R² Score** | **Coefficient of Determination** — Statistical goodness-of-fit (1.0 = perfect model) | `r2_score(y_test, y_pred)` |

---

## 💡 Key Pipeline Features Implemented

* [x] **Automated Data Processing**: Converts native text objects to true datetimes with zero overhead.
* [x] **Chronological Data Splitting**: Avoids random leaks by establishing strict out-of-time future validation.
* [x] **Temporal Feature Engineering**: Extracts contextual calendar dependencies (`year`, `month`, `dayofweek`).
* [x] **Modularized Infrastructure**: Code separated into isolated, maintainable production scripts inside `src/`.
* [x] **Production Report Exports**: Saves visualization tracking charts directly to `outputs/charts/` and raw spreadsheets to `outputs/forecasts/`.

---

## 📤 Final Deliverables Generated

Upon successful pipeline completion, the following automated corporate assets are created:

1. **Visual Forecast Performance Map**: Located at `outputs/charts/forecast_vs_actual.png`, showcasing the comparison of predicted demand alongside actual validation trends.
2. **Business Reporting Matrix Spreadsheet**: Exported directly to `outputs/forecasts/final_sales_forecast.csv` for immediate cross-department reporting or power BI connection.

---

## 🏆 Professional Skills Gained

* Architectural engineering of end-to-end Machine Learning pipelines.
* Out-of-time chronological validation practices for predictive models.
* Modular code optimization (`src/`) adhering to professional production engineering standards.
* Quantitative business model benchmarking and analysis.

---

## 🔗 Internship Details

| Field | Info |
| --- | --- |
| **Organization** | Future Interns |
| **Track** | Machine Learning (ML) |
| **Task Number** | 01 |
| **Repository Format** | `FUTURE_ML_01` |
| **Submission** | Via official Future Interns Task Portal (CIN ID Required) |
| **LinkedIn** | [Future Interns](https://www.linkedin.com/company/future-interns/) |
| **Website** | [futureinterns.com](https://futureinterns.com) |

---

## 👤 Author

**Naol Gonfa (Nileget)**

* **GitHub**: [@Naol724](https://github.com/Naol724)
* **Website**: [naol.online](https://naol.online)
* **Telegram**: [@nilegt_](https://www.google.com/search?q=https://t.me/nilegt_)

---

> *"Consistency builds mastery."*
