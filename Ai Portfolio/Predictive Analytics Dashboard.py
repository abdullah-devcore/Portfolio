import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

# Sample Dataset (you can replace later)
data = {
    "Hours_Studied": [1, 2, 3, 4, 5, 6, 7, 8],
    "Scores": [30, 35, 50, 55, 65, 70, 80, 90]
}

df = pd.DataFrame(data)

# Features and Target
X = df[["Hours_Studied"]]
y = df["Scores"]

# Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Model
model = LinearRegression()
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Accuracy
accuracy = r2_score(y_test, y_pred)

print("\n📊 MODEL PERFORMANCE")
print("Accuracy:", round(accuracy * 100, 2), "%")

# User Input Prediction
hours = float(input("\nEnter hours studied to predict score: "))
prediction = model.predict([[hours]])

print(f"📈 Predicted Score: {prediction[0]:.2f}")