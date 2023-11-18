import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { colors } from 'app/theme';
import filter from 'lodash.filter';

export default function SearchBar() {

  return(
  <View>
    <TextInput 
    placeholder='Rechercher une excursion' 
    clearButtonMode='always' 
    style={styles.searchBox} 
    autoCorrect={false} 
    placeholderTextColor={colors.palette.gris}
    />
  </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent : 'center',

  },

  searchBox: {
    
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    color: colors.palette.noir,
    backgroundColor: colors.palette.blanc,

    margin: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    
    elevation: 3,
}});




