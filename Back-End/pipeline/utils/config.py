import os
import yaml
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.yaml')


def load_config() -> Dict[str, Any]:
    try:
        with open(CONFIG_FILE, 'r') as f:
            config = yaml.safe_load(f)
        return config or {}
    except Exception as e:
        logger.error(f'Error loading configuration: {e}')
        return {}

def get_config() -> Dict[str, Any]:
    return load_config()


def get_paths_config() -> Dict[str, Any]:
    return get_config().get('paths', {})


def get_models_config() -> Dict[str, Any]:
    return get_config().get('models', {})


def get_baselines_config() -> Dict[str, Any]:
    return get_config().get('baselines', {})


def get_preprocessing_config() -> Dict[str, Any]:
    return get_config().get('preprocessing', {})


def get_bilstm_config() -> Dict[str, Any]:
    return get_config().get('bilstm', {})


def get_yield_config() -> Dict[str, Any]:
    return get_config().get('yield', {})


def get_stage_mapping() -> Dict[str, int]:
    return get_config().get('stage_mapping', {
        'Transplant': 0,
        'Vegetative': 1,
        'Reproductive': 2,
        'Ripening': 3,
        'Harvest': 4,
    })


def get_final_target_columns() -> list[str]:
    return get_config().get('final_target_columns', [])


def get_data_config() -> Dict[str, Any]:
    config = get_config()
    return config.get('data', {})


def update_config(updates: Dict[str, Any]) -> None:
    config_path = CONFIG_FILE
    config = get_config()
    for key, value in updates.items():
        keys = key.split('.')
        current = config
        for k in keys[:-1]:
            if k not in current:
                current[k] = {}
            current = current[k]
        current[keys[-1]] = value
    with open(config_path, 'w') as file:
        yaml.dump(config, file, default_flow_style=False)
