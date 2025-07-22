import  { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import WeatherWeek from './WeatherWeek';

const Weather = () => {
  const [city, setCity] = useState('Tel Aviv');
  const [inputCity, setInputCity] = useState('Tel Aviv');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWeeklyWeather, setShowWeeklyWeather] = useState(false);

  const apiKey = '2a80e6f45343093bc40b5ce047445df0';

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) throw new Error('City not found.');
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (inputCity.trim()) {
      setCity(inputCity.trim());
      setShowWeeklyWeather(false);
    }
  };

  const getBackgroundColor = () => {
    if (!weatherData) return ['#cccccc', '#dddddd'];
    const temp = weatherData.main.temp;
    if (temp < 10) return ['#4facfe', '#00f2fe'];
    if (temp < 25) return ['#43e97b', '#38f9d7'];
    return ['#f7971e', '#ffd200']; 
  };

  const [colorTop, colorBottom] = getBackgroundColor();

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colorTop }]}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          value={inputCity}
          onChangeText={setInputCity}
          placeholder="Enter city"
        />
        <Button title="Search" onPress={handleSearch} color="#007AFF" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : weatherData ? (
        <View style={styles.weatherBox}>
          <Text style={styles.cityName}>{weatherData.name}</Text>
          <Text style={styles.temp}>{weatherData.main.temp}°C</Text>
          <Image
            source={{
              uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`,
            }}
            style={styles.icon}
          />
          <Text style={styles.description}>{weatherData.weather[0].description}</Text>
        </View>
      ) : null}

      <Button
        title="Get Weekly Forecast"
        onPress={() => setShowWeeklyWeather(true)}
        disabled={!weatherData}
        color="#007AFF"
      />

      {showWeeklyWeather && <WeatherWeek />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    marginTop: 50,
    marginBottom: 20,
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  weatherBox: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 10,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  temp: {
    fontSize: 40,
    color: '#FF8C00',
  },
  description: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  icon: {
    width: 100,
    height: 100,
  },
});

export default Weather;