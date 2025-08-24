#!/usr/bin/env python3
"""
Script to convert .h5 model to TensorFlow.js format
"""

import tensorflow as tf
import os

def convert_h5_to_tfjs():
    """
    Convert the sign_language_model.h5 to TensorFlow.js format
    """
    try:
        # Load the .h5 model
        print("Loading .h5 model...")
        model = tf.keras.models.load_model('sign_language_model.h5')
        
        # Print model summary
        print("\nModel Summary:")
        model.summary()
        
        # Create output directory
        output_dir = 'public/model'
        os.makedirs(output_dir, exist_ok=True)
        
        # Convert to TensorFlow.js format
        print(f"\nConverting to TensorFlow.js format...")
        tfjs.converters.save_keras_model(model, output_dir)
        
        print(f"Model converted successfully!")
        print(f"Output directory: {output_dir}")
        print("\nFiles created:")
        for file in os.listdir(output_dir):
            print(f"  - {file}")
            
    except Exception as e:
        print(f"Error converting model: {e}")
        print("\nMake sure you have the following packages installed:")
        print("pip install tensorflow tensorflowjs")

if __name__ == "__main__":
    # Check if tensorflowjs is available
    try:
        import tensorflowjs as tfjs
        convert_h5_to_tfjs()
    except ImportError:
        print("tensorflowjs package not found.")
        print("Please install it using: pip install tensorflowjs")
        print("Then run this script again.")
