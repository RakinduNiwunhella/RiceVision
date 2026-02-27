import logging
from typing import Dict, Any

import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ModelEvaluator:
    def __init__(
                self,
                model,
                model_name
                ):
        self.model = model 
        self.model_name = model_name
        self.evaluation_results = {}

    def evaluate(
                self,
                X_test,
                Y_test
                ):
        Y_pred = self.model.predict(X_test)

        average = 'binary' if len(np.unique(Y_test)) == 2 else 'macro'
        cm = confusion_matrix(Y_test, Y_pred)
        accuracy = accuracy_score(Y_test, Y_pred)
        precision = precision_score(Y_test, Y_pred, average=average, zero_division=0)
        recall = recall_score(Y_test, Y_pred, average=average, zero_division=0)
        f1 = f1_score(Y_test, Y_pred, average=average, zero_division=0)

        self.evaluation_results = {
                                    'cm' : cm,
                                    'accuracy' : accuracy,
                                    'precision' : precision,
                                    'recall' : recall,
                                    'f1' : f1,
                                    'average': average
                                    }
        return self.evaluation_results