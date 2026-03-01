
import React from 'react';
import { motion } from 'framer-motion';

const WelcomeMessage = () => {
  return (
    <motion.p
      className='text-xl md:text-2xl text-white max-w-2xl mx-auto'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      Hola! Soy <span className='font-semibold text-amber-400'>Horizons</span>, tu asistente del sistema Arqueo de Caja.
      ¡Estoy aquí para ayudarte a gestionar tus operaciones diarias de manera eficiente!
    </motion.p>
  );
};

export default WelcomeMessage;
