import React from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react';
import { WeatherCategory } from '../../types/weather';
import { cn } from '../../lib/utils';

interface WeatherIconProps {
  category: WeatherCategory;
  weatherCode?: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  category,
  weatherCode,
  className,
}) => {
  switch (category) {
    case 'sunny':
      return (
        <Sun
          className={cn('w-5 h-5 text-amber-300', className)}
          aria-hidden="true"
          data-weather-icon="sunny"
        />
      );
    case 'cloudy':
      if (weatherCode === 2) {
        return (
          <CloudSun
            className={cn('w-5 h-5 text-zinc-300', className)}
            aria-hidden="true"
            data-weather-icon="cloudy"
          />
        );
      }
      return (
        <Cloud
          className={cn('w-5 h-5 text-zinc-300', className)}
          aria-hidden="true"
          data-weather-icon="cloudy"
        />
      );
    case 'rainy':
      if (weatherCode === 51 || weatherCode === 53 || weatherCode === 55) {
        return (
          <CloudDrizzle
            className={cn('w-5 h-5 text-sky-400', className)}
            aria-hidden="true"
            data-weather-icon="rainy"
          />
        );
      }
      return (
        <CloudRain
          className={cn('w-5 h-5 text-sky-400', className)}
          aria-hidden="true"
          data-weather-icon="rainy"
        />
      );
    case 'snowy':
      return (
        <CloudSnow
          className={cn('w-5 h-5 text-indigo-200', className)}
          aria-hidden="true"
          data-weather-icon="snowy"
        />
      );
    case 'stormy':
      return (
        <CloudLightning
          className={cn('w-5 h-5 text-amber-400', className)}
          aria-hidden="true"
          data-weather-icon="stormy"
        />
      );
    default:
      return (
        <Cloud
          className={cn('w-5 h-5 text-zinc-300', className)}
          aria-hidden="true"
          data-weather-icon="cloudy"
        />
      );
  }
};

