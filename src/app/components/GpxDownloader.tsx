import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { parseString } from 'react-native-xml2js'; // Assurez-vous d'utiliser parseString depuis react-native-xml2js

const YourComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <person>
          <name>John Doe</name>
          <age>30</age>
          <city>New York</city>
        </person>
        <person>
          <name>Jane Smith</name>
          <age>25</age>
          <city>Los Angeles</city>
        </person>
      </root>`;

    parseString(xmlString, (error, result) => {
      if (error) {
        console.error('Error parsing XML:', error);
      } else {
        // Les données sont stockées dans le format JSON dans result
        setData(result);
      }
    });
  }, []);

  return (
    <View>
      {data && data.root && data.root.person.map((person, index) => (
        <View key={index}>
          <Text>Name: {person.name}</Text>
          <Text>Age: {person.age}</Text>
          <Text>City: {person.city}</Text>
        </View>
      ))}
    </View>
  );
};

export default YourComponent;
