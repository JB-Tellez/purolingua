const decks = [
    {
        id: 'daily',
        title: 'Vita Quotidiana',
        description: 'Frasi utili per la vita di tutti i giorni.',
        cards: [
            {
                front: "Ho perso il treno.",
                back: "Non sono arrivato in tempo alla stazione."
            },
            {
                front: "Dove posso comprare i biglietti?",
                back: "Cerco un posto per acquistare i ticket."
            },
            {
                front: "Mi sono svegliato tardi.",
                back: "Ho dormito più del previsto."
            },
            {
                front: "Hai voglia di uscire stasera?",
                back: "Ti va di fare qualcosa insieme questa sera?"
            },
            {
                front: "Che tempo fa oggi?",
                back: "Com'è il meteo adesso?"
            },
            {
                front: "Ho bisogno di una pausa.",
                back: "Devo riposarmi un po'."
            },
            {
                front: "Sono stanco morto.",
                back: "Sono completamente esausto."
            },
            {
                front: "Non ho tempo adesso.",
                back: "Sono troppo occupato in questo momento."
            }
        ]
    },
    {
        id: 'restaurant',
        title: 'Al Ristorante',
        description: 'Ordinare cibo e chiedere il conto.',
        cards: [
            {
                front: "Vorrei prenotare un tavolo per due.",
                back: "Chiamo per riservare due posti."
            },
            {
                front: "Il conto, per favore.",
                back: "Vorrei pagare adesso."
            },
            {
                front: "Sono allergico alle noci.",
                back: "Non posso mangiare noci per motivi di salute."
            },
            {
                front: "Avete piatti vegetariani?",
                back: "Cerco opzioni senza carne o pesce."
            },
            {
                front: "Cosa mi consiglia?",
                back: "Qual è la sua raccomandazione?"
            },
            {
                front: "Questo è delizioso!",
                back: "È buonissimo!"
            },
            {
                front: "Vorrei un po' d'acqua, per favore.",
                back: "Mi può portare dell'acqua?"
            },
            {
                front: "Il servizio è incluso?",
                back: "La mancia è compresa nel conto?"
            }
        ]
    },
    {
        id: 'travel',
        title: 'In Viaggio',
        description: 'Muoversi in città e chiedere indicazioni.',
        cards: [
            {
                front: "Quanto dista il centro?",
                back: "È lontano il centro città da qui?"
            },
            {
                front: "Mi sono perso.",
                back: "Non so dove mi trovo."
            },
            {
                front: "A che ora parte il treno?",
                back: "Quando lascia la stazione il treno?"
            },
            {
                front: "Dov'è la fermata dell'autobus?",
                back: "Cerco il luogo dove prendere il bus."
            },
            {
                front: "Può indicarmi sulla mappa?",
                back: "Mi può mostrare dove siamo sulla cartina?"
            },
            {
                front: "Quanto costa il biglietto?",
                back: "Qual è il prezzo del ticket?"
            },
            {
                front: "È lontano a piedi?",
                back: "Posso arrivarci camminando?"
            },
            {
                front: "Devo cambiare treno?",
                back: "È necessario fare un trasbordo?"
            }
        ]
    },
    {
        id: 'shopping',
        title: 'Fare Spese',
        description: 'Comprare nei negozi e al mercato.',
        cards: [
            {
                front: "Quanto costa questo?",
                back: "Qual è il prezzo di questo articolo?"
            },
            {
                front: "Posso provarlo?",
                back: "È possibile fare una prova?"
            },
            {
                front: "Avete una taglia più grande?",
                back: "Esiste questa in una misura superiore?"
            },
            {
                front: "È troppo caro.",
                back: "Il prezzo è eccessivo per me."
            },
            {
                front: "Accettate carte di credito?",
                back: "Posso pagare con la carta?"
            },
            {
                front: "Posso avere uno sconto?",
                back: "È possibile un prezzo ridotto?"
            },
            {
                front: "Dove sono i camerini?",
                back: "Dove posso provare i vestiti?"
            },
            {
                front: "Vorrei restituire questo.",
                back: "Devo fare un reso di questo prodotto."
            }
        ]
    },
    {
        id: 'hotel',
        title: 'In Albergo',
        description: 'Prenotazioni e servizi in hotel.',
        cards: [
            {
                front: "Ho una prenotazione a nome Rossi.",
                back: "Il mio nome è Rossi e ho riservato una camera."
            },
            {
                front: "A che ora è il check-out?",
                back: "Quando devo lasciare la stanza?"
            },
            {
                front: "La colazione è inclusa?",
                back: "Il breakfast fa parte del prezzo?"
            },
            {
                front: "Il WiFi non funziona.",
                back: "La connessione internet è rotta."
            },
            {
                front: "Può chiamarmi un taxi?",
                back: "Mi serve un'auto per favore."
            },
            {
                front: "Vorrei un'altra camera.",
                back: "Posso cambiare stanza?"
            },
            {
                front: "Dov'è la palestra?",
                back: "Dove si trova la sala fitness?"
            },
            {
                front: "Ho bisogno di più asciugamani.",
                back: "Mi servono altri teli."
            }
        ]
    },
    {
        id: 'emergencies',
        title: 'Emergenze',
        description: 'Frasi importanti per situazioni urgenti.',
        cards: [
            {
                front: "Ho bisogno di aiuto!",
                back: "Mi serve assistenza urgente!"
            },
            {
                front: "Chiamate un medico!",
                back: "Ho bisogno di un dottore subito!"
            },
            {
                front: "Ho perso il passaporto.",
                back: "Non trovo più il mio documento."
            },
            {
                front: "Dov'è l'ospedale più vicino?",
                back: "Quale ospedale è il più prossimo?"
            },
            {
                front: "Mi hanno rubato il portafoglio.",
                back: "Qualcuno ha preso i miei soldi."
            },
            {
                front: "Non mi sento bene.",
                back: "Sto male."
            },
            {
                front: "Dov'è la farmacia?",
                back: "Cerco una farmacia."
            },
            {
                front: "C'è stato un incidente.",
                back: "È successo qualcosa di grave."
            }
        ]
    },
    {
        id: 'social',
        title: 'Conversazioni Sociali',
        description: 'Presentarsi e parlare con le persone.',
        cards: [
            {
                front: "Come ti chiami?",
                back: "Qual è il tuo nome?"
            },
            {
                front: "Piacere di conoscerti.",
                back: "Felice di fare la tua conoscenza."
            },
            {
                front: "Di dove sei?",
                back: "Da quale città o paese vieni?"
            },
            {
                front: "Che lavoro fai?",
                back: "Qual è la tua professione?"
            },
            {
                front: "Parli inglese?",
                back: "Conosci la lingua inglese?"
            },
            {
                front: "Mi dispiace, non capisco.",
                back: "Scusa, non ho compreso."
            },
            {
                front: "Può ripetere, per favore?",
                back: "Può dirlo di nuovo?"
            },
            {
                front: "Parliamo più tardi.",
                back: "Ci sentiamo dopo."
            }
        ]
    },
    {
        id: 'weather',
        title: 'Il Tempo',
        description: 'Parlare del meteo e delle stagioni.',
        cards: [
            {
                front: "Fa molto caldo oggi.",
                back: "La temperatura è alta."
            },
            {
                front: "Sta piovendo.",
                back: "Cade la pioggia."
            },
            {
                front: "Che bella giornata!",
                back: "Il tempo è magnifico!"
            },
            {
                front: "Fa freddo stamattina.",
                back: "La temperatura è bassa questa mattina."
            },
            {
                front: "Pensi che nevicherà?",
                back: "Secondo te cadrà la neve?"
            },
            {
                front: "È nuvoloso.",
                back: "Il cielo è coperto."
            },
            {
                front: "C'è vento.",
                back: "Tira aria."
            },
            {
                front: "Dovrebbe schiarire nel pomeriggio.",
                back: "Il tempo migliorerà più tardi."
            }
        ]
    }
];
