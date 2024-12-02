import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Image,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const CriarEvento = ({ navigation }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataHora, setDataHora] = useState(new Date());
  const [localizacao, setLocalizacao] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gostos, setGostos] = useState([]);
  const [gostoSelecionado, setGostoSelecionado] = useState('');
  const [eventoPrivacidade, setEventoPrivacidade] = useState('publico');
  const [senhaConvite, setSenhaConvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Controle das etapas
  const [imageUri, setImageUri] = useState(null); // Armazena a URI da imagem selecionada
  const user = getAuth().currentUser;

  const eventsData = [
    { id: '1', image: require('./assets/fotosEventos/evento1.jpg'), imagem: "1" },
    { id: '2', image: require('./assets/fotosEventos/evento2.jpg'), imagem: "2" },
    { id: '3', image: require('./assets/fotosEventos/evento3.jpg'), imagem: "3" },
    { id: '4', image: require('./assets/fotosEventos/evento4.jpg'), imagem: "4" },
    { id: '5', image: require('./assets/fotosEventos/evento5.jpg'), imagem: "5" },
  ];

  const goBack = () => {
    navigation.goBack(); // Assumes `navigation` is provided via props or context.
  };

  const showDateTimePicker = () => setShowDatePicker(true);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    setDataHora(selectedDate || dataHora);
  };

  const handleEventoSubmit = async () => {
    if (!titulo || !descricao || !localizacao || !gostoSelecionado) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'eventos'), {
        titulo,
        descricao,
        dataHora: serverTimestamp(),
        localizacao,
        videoLink,
        gosto: gostoSelecionado,
        usuarioId: user.uid,
        dataCriacao: serverTimestamp(),
        privacidade: eventoPrivacidade,
        senhaConvite: eventoPrivacidade === 'privado' ? senhaConvite : null,
        imagem: imageUri, // Armazena a URI ou o require da imagem
      });

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar o evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && titulo && descricao) {
      setStep(2);
    } else if (step === 2 && localizacao && gostoSelecionado) {
      setStep(3);
    } else if (step === 3) {
      handleEventoSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cimas}>
        <TouchableOpacity onPress={goBack}>
        <Image source={require('./assets/voltarImg.png')} style={styles.codeIcon} />
</TouchableOpacity>
      </View>
      <Text style={styles.title}>Criar Evento</Text>

      {/* Etapa 1 */}
      {step === 1 && (
        <>
          <Text style={styles.sectionTitle}>Selecione uma imagem:</Text>
          <FlatList
            data={eventsData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setImageUri(item.image)}>
                <Image source={item.image} style={styles.carouselImage} />
                
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          />
          {imageUri && (
            <Image 
              source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri}
              style={styles.selectedImage} 
            />
          )}
<Text style={styles.sectionTitle}>Acrescente um Título:</Text>
          <TextInput
            style={styles.input}
            placeholder="Título do Evento"
            placeholderTextColor="#aaa"
            value={titulo}
            onChangeText={setTitulo}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição do Evento"
            placeholderTextColor="#aaa"
            value={descricao}
            onChangeText={setDescricao}
            multiline
          />
        </>
      )}

      {/* Etapa 2 */}
      {step === 2 && (
        <>
          <TouchableOpacity onPress={showDateTimePicker} style={styles.input}>
            <Text style={styles.dateText}>{dataHora.toLocaleString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dataHora}
              mode="datetime"
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Localização"
            placeholderTextColor="#aaa"
            value={localizacao}
            onChangeText={setLocalizacao}
          />
        </>
      )}

      {/* Etapa 3 */}
      {step === 3 && (
        <>
          <Text style={styles.sectionTitle}>Escolha um Gosto:</Text>
          <FlatList
            data={gostos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.gostoItem,
                  gostoSelecionado === item && styles.gostoItemSelected,
                ]}
                onPress={() => setGostoSelecionado(item)}
              >
                <Text style={styles.gostoText}>{item}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity onPress={nextStep} style={styles.button}>
            <Text style={styles.buttonText}>Criar Evento</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Botão de Avançar */}
      {step !== 3 && (
        <TouchableOpacity onPress={nextStep} style={styles.button}>
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator size="large" color="#9F3EFC" />}
      <Image source={require('./assets/black1.png')} style={styles.backgroundImageColor} />
      <Image source={require('./assets/eclipse1.png')} style={styles.backgroundImageColor2} />
      
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImageColor: {
    position: 'absolute',
    width: 700, // Largura fixa
    height: '100%', // Altura total
    left: '90%', // Move para o centro
    transform: [{ translateX: -350 }], // Ajusta metade da largura para centralizar
    bottom: 400,
    zIndex: 2,
  },
  backgroundImageColor2: {
    position: 'absolute',
    width: 700, // Largura fixa
    height: '100%', // Altura total
     // Move para o centro
    transform: [{ translateX: -350 }], // Ajusta metade da largura para centralizar
    bottom: 400,
    zIndex: 1,

  },
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#000' },
  cimas: {
    width: '100%',
    flexDirection: 'row',
    zIndex: 10,
    marginTop: 35,


  },
  title: { fontSize: 34, color: '#fff',  width: '40%', fontFamily: 'Raleway-Bold', zIndex: 10, },
  sectionTitle: { fontSize: 18, color: '#fff', marginBottom: 10, zIndex: 10, fontFamily: 'Montserrat-Regular' },
  input: { borderWidth: 0.5, borderColor: '#ddd', padding: 10, marginVertical: 10, color: '#fff', borderRadius: 5, fontFamily: 'Inter-Regular', zIndex: 10 },
  button: { backgroundColor: '#9F3EFC', padding: 15, borderRadius: 10, marginTop: 20, Index: 10 },
  buttonText: { textAlign: 'center', color: '#fff', fontSize: 16 },
  carouselContainer: { marginVertical: 15, zIndex: 10 },
  carouselImage: { width: 150, height: 280, marginHorizontal: 10, borderRadius: 10 , zIndex: 10},
  imageLabel: { textAlign: 'center', color: '#fff', marginTop: 5 },
  selectedImage: { width: 100, height: 100, borderRadius: 10, marginTop: 20 },
  gostoItem: { padding: 10, backgroundColor: '#333', borderRadius: 10, marginRight: 10 },
  gostoItemSelected: { backgroundColor: '#9F3EFC' },
  gostoText: { color: '#fff' },
});

export default CriarEvento;
