// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// const WeatherWeek = () => {
//   const [forecastData, setForecastData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const apiKey = 'f2a80602614f25f210330b413159071e'; // Replace with your OpenWeatherMap API key
//   const city = 'London';
//   useEffect(() => {
//     const fetchHourlyForecast = async () => {
//       try {
//         const response = await fetch(
//           `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
//         );

//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }

//         const data = await response.json();
//         setForecastData(data);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHourlyForecast();
//   }, [city]);

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" />;
//   }

//   if (error) {
//     return <Text style={styles.error}>{error}</Text>;
//   }

//   return (
//     <View style={styles.container}>
//       {forecastData && forecastData.list.map((hour, index) => (
//         <View key={index} style={styles.forecastItem}>
//           <Text>{new Date(hour.dt * 1000).toLocaleTimeString()}: {hour.main.temp}°C</Text>
//         </View>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   forecastItem: {
//     marginBottom: 10,
//   },
//   error: {
//     color: 'red',
//   },
// });

// export default WeatherWeek;
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const WeatherWeek = () => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedForecasts, setGroupedForecasts] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const apiKey = 'f2a80602614f25f210330b413159071e';
  const city = 'London';

  useEffect(() => {
    const fetchHourlyForecast = async () => {
      try {
        const response = await fetch(
          `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        setForecastData(data);
        const grouped = groupForecastsByDay(data.list);
        setGroupedForecasts(grouped);
        if (Object.keys(grouped).length > 0) setSelectedDay(Object.keys(grouped)[0]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHourlyForecast();
  }, [city]);

  const groupForecastsByDay = (forecastList) => {
    const grouped = {};
    forecastList.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(forecast);
    });
    return grouped;
  };

  const getWeatherIcon = (iconCode) => `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const formatTime = (timestamp) => new Date(timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDay = (day) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    return day === today ? 'Today' : day.split(',')[0];
  };
  const getDayAverageTemp = (forecasts) => Math.round(forecasts.reduce((acc, f) => acc + f.main.temp, 0) / forecasts.length);
  const getDayWeatherIcon = (forecasts) => {
    const counts = {};
    forecasts.forEach(f => {
      const icon = f.weather[0].icon;
      counts[icon] = (counts[icon] || 0) + 1;
    });
    return Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const getBackgroundColors = (temp) => {
    if (temp < 10) return ['#74ebd5', '#ACB6E5']; // cold
    if (temp < 20) return ['#fbc2eb', '#a6c1ee']; // mild
    return ['#fceabb', '#f8b500']; // warm
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading forecast data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  const avgTemp = selectedDay ? getDayAverageTemp(groupedForecasts[selectedDay]) : 20;
  const gradientColors = getBackgroundColors(avgTemp);

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
        {Object.keys(groupedForecasts).map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayItem, selectedDay === day && styles.selectedDayItem]}
            onPress={() => setSelectedDay(day)}>
            <Text style={[styles.dayText, selectedDay === day && styles.selectedDayText]}>{formatDay(day)}</Text>
            {getDayWeatherIcon(groupedForecasts[day]) && (
              <Image source={{ uri: getWeatherIcon(getDayWeatherIcon(groupedForecasts[day])) }} style={styles.dayIcon} />
            )}
            <Text style={[styles.dayTemp, selectedDay === day && styles.selectedDayText]}>{getDayAverageTemp(groupedForecasts[day])}°C</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedDay && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyContainer}>
          {groupedForecasts[selectedDay].map((forecast, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastTime}>{formatTime(forecast.dt)}</Text>
              <Image source={{ uri: getWeatherIcon(forecast.weather[0].icon) }} style={styles.forecastIcon} />
              <Text style={styles.forecastTemp}>{Math.round(forecast.main.temp)}°C</Text>
              <View style={styles.forecastDetails}>
                <Text style={styles.forecastDetail}>{forecast.main.humidity}%</Text>
                <Text style={styles.forecastDetail}>{Math.round(forecast.wind.speed * 3.6)} km/h</Text>
              </View>
              <Text style={styles.forecastDescription}>{forecast.weather[0].description}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#d9534f',
    fontSize: 14,
    textAlign: 'center',
  },
  daysContainer: {
    paddingVertical: 10,
    marginBottom: 15,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    minWidth: 80,
  },
  selectedDayItem: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  selectedDayText: {
    color: '#000',
  },
  dayIcon: {
    width: 40,
    height: 40,
  },
  dayTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  hourlyContainer: {
    paddingBottom: 10,
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 15,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: 110,
  },
  forecastTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  forecastIcon: {
    width: 50,
    height: 50,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  forecastDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  forecastDetail: {
    fontSize: 12,
    color: '#fff',
  },
  forecastDescription: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});

export default WeatherWeek