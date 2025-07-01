importer React depuis 'react' ;
   
importer { Vue , Texte , Feuille de style , ScrollView , TouchableOpacity , Alerte , Plateforme } depuis 'react-native' ;
 
importer { useRouter, useLocalSearchParams } depuis 'expo-router' ;
 
importer { useTheme } depuis '@/contexts/ThemeContext' ;
 
importer { useLetters } depuis '@/contexts/LetterContext' ;
 
importer { useUser } depuis '@/contexts/UserContext' ;
 
importer { ArrowLeft , Share2 , Download , Mail , Printer } depuis 'lucide-react-native' ;
 
importer * comme Partage depuis 'expo-sharing' ;
   
importer * comme Imprimer depuis 'expo-print' ;
   
importer * en tant que MailComposer depuis 'expo-mail-composer' ;
   
importer { generateLetterContent, generatePdf } depuis '@/utils/letterPdf' ;
 

fonction d'exportation par défaut LetterPreviewScreen ( ) {
   
  const { letterId } = useLocalSearchParams<{ letterId : string }>();
  const { couleurs } = useTheme ();
  const { lettres } = useLetters ();
  const { profil } = useUser ();
  const routeur = useRouter ();

  const lettre = lettres.find ( l => l.id === letterId
 ) ;

  si (!lettre) {
    retour (
      < Afficher le style = {[styles.container, { backgroundColor: colors.background }]}>  
        <Textstyle={[styles.errorText, { color:colors.error }]}>Courrier non trouvé</Text>  
      </ Voir >
    );
  }

  const handleShare = async ( ) => {
 
    essayer {
      const pdfUri = await generatePdf (lettre, profil);
 
      si ( Plateforme . OS === 'web' ) {
        si (navigateur. partager ) {
          attendre navigator.share ( { titre : letter.title , url : pdfUri });
        } autre {
          const lien = document . createElement ( 'a' );
          lien. href = pdfUri;
          lien. télécharger = ` ${letter.title} .pdf` ;
          lien. cliquez ();
        }
      } else if ( wait Sharing . isAvailableAsync ()) {
  
        attendre le partage . shareAsync (pdfUri);
 
      } autre {
        Alert.alert('Erreur', "Le partage n'est pas disponible");
      }
    } catch (erreur) {
      Alert.alert('Erreur', 'Impossible de partager le courrier');
    }
  };

  const handleDownload = async ( ) => {
 
    essayer {
      const pdfUri = await generatePdf (lettre, profil);
 
      si ( Plateforme . OS === 'web' ) {
        const lien = document . createElement ( 'a' );
        lien. href = pdfUri;
        lien. télécharger = ` ${letter.title} .pdf` ;
        lien. cliquez ();
      } else if ( wait Sharing . isAvailableAsync ()) {
  
        attendre le partage . shareAsync (pdfUri);
 
      } autre {
        Alert.alert('Erreur', "Le téléchargement n'est pas disponible");
      }
    } catch (erreur) {
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };

  const handleEmail = async ( ) => {
 
    essayer {
      const isAvailable = await MailComposer . isAvailableAsync ();
 

      si (est disponible) {
        const pdfUri = await generatePdf (lettre, profil);
 
        const letterContent = generateLetterContent (lettre, profil);
        attendre MailComposer . composeAsync ({
 
          destinataires : [lettre. destinataire . email ]. filtre ( booléen ),
          sujet : lettre. titre ,
          corps : ` ${letterContent.content} \n\nCordialement,\n ${profile.firstName} ${profile.lastName} ` ,
 
          pièces jointes : [pdfUri],
        });
      } autre {
        Alert.alert('Email', 'Client email non disponible');
      }
    } catch (erreur) {
      Alert.alert('Erreur', "Impossible d'envoyer le courrier");
    }
  };

  const handlePrint = async ( ) => {
 
    essayer {
      si ( Plateforme . OS === 'web' ) {
        fenêtre . print ();
      } autre {
        const letterContent = generateLetterContent ( lettre, profil );
        const htmlContent = `
          <html>
            <tête>
              <meta charset="utf-8">
              <titre> ${lettre.titre} </titre>
              <style>
                corps { 
                  famille de polices : Arial, sans-serif ; 
                  marge : 40px ; 
                  hauteur de ligne : 1,6 ; 
                  couleur : #333;
                }
                .en-tête { 
                  affichage : flex ; 
                  justifier-contenu : espace-entre ; 
                  marge inférieure : 40 px ; 
                }
                .sender { taille de police : 14 px ; }
                .date { taille de police : 14 px ; alignement du texte : à droite ; }
                .destinataire { marge inférieure : 30 px ; taille de police : 14 px ; }
                .subject { marge inférieure : 30 px ; épaisseur de police : gras ; }
                .contenu { marge inférieure : 40 px ; hauteur de ligne : 1,8 ; }
                .signature { text-align: right; margin-top: 40px; }
              </style>
            </head>
            <corps>
              <div class="header">
                <div class="sender"> ${letterContent.sender.replace(/\n/g, '<br>' )} </div>
                <div class="date"> ${letterContent.location} , le ${letterContent.date} </div>
              </div>
              <div class="recipient"> ${letterContent.recipient.replace(/\n/g, '<br>' )} </div>
              <div class="subject">Objet : ${letterContent.subject} </div>
              <div class="content"> ${letterContent.content.replace(/\n/g, '<br><br>' )} </div>
              <div class="signature"> ${profile.firstName} ${profile.lastName} </div>
 
            </body>
          </html>
        ` ;
        
        attendre Imprimer . printAsync ({ html : htmlContent });
 
      }
    } catch (erreur) {
      Alert.alert('Erreur', 'Impossible d\'imprimer le courrier');
    }
  };

  const letterContent = generateLetterContent (lettre, profil);

  retour (
    <Style de vue={[styles.container, { backgroundColor: colors.background }]}>
      <Afficher le style={styles.header}>
        <Opacité tactile 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => routeur.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Aperçu du courrier</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Style d'affichage={[styles.letterContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Afficher le style={styles.letterHeader}>
            <Afficher le style={styles.senderInfo}>
              <Text style={[styles.senderText, { color: colors.text }]}>{letterContent.sender}</Text>
            </View>
            <Style de vue={styles.dateLocation}>
              <Style de texte={[styles.dateText, { couleur: couleurs.texte }]}>
                {letterContent.location}, le {letterContent.date}
              </Texte>
            </View>
          </View>
