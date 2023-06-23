// ==UserScript==
// @name         Transifex Utils
// @author       firebomb1
// @namespace    https://app.transifex.com/
// @version      1
// @description  Various utils for Tansifex UI
// @match        https://app.transifex.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Glossary of named HTML entities to search and replace.
    const namedEntities = {
        '&quot;': '"',
        '&amp;': '&',
        '&apos;': '\'',
    };

    // Glossary of terms to search and replace when cleaning content.
    const termReplacements = {
        'partenaires de distribution': 'partenaires de canal',
        'partenaires de la chaîne': 'partenaires de canal',
        'partenaire de distribution': 'partenaire de canal',
        'partenaires de chaîne': 'partenaires de canal',
        'partenaire de chaîne': 'partenaire de canal',
        'portefeuilles': 'porte-monnaie',
        'portefeuille': 'porte-monnaie',
        ' de potins': ' de bavardage',
        ' de ragots': ' de bavardage',
        ' de commérage': ' de bavardage',
        ' [gG]ossip': ' de bavardage',
        'commérages': 'bavardages',
        'potins': 'bavardages',
        'réseau Lightning': 'Lightning Network',
        'de foudre': 'Lightning',
        'en chaîne': 'sur la chaîne',
        ' de clôture': ' de fermeture',
        'pair à pair': 'pair-à-pair',
        'peer-to-peer': 'pair-à-pair',
        'd\'égal à égal': 'de pair-à-pair',
        'recherche de chemin': 'pathfinding',
        'Bob\'s Cafe': 'Café de Bob',
        'référentiel': 'dépôt',
        'plate-forme': 'plateforme',
        'plates-formes': 'plateformes',
        'hot wallet': 'porte-monnaie chaud',
        'cold wallet': 'porte-monnaie froid',
        'submarine swaps': 'échanges sous-marins',
        'submarine swap': 'échange sous-marin',
        'swaps sous-marins': 'échanges sous-marins',
        'swap sous-marin': 'échange sous-marin',
        'échanges de sous-marins': 'échanges sous-marins',
        'échanges de sous-marin': 'échanges sous-marins',
        'échange de sous-marins': 'échange sous-marin',
        'échange de sous-marin': 'échange sous-marin',
        '2 sur 2': '2-de-2',
        '&gt; &gt;': '&gt;&gt;',
        ' ::': '::',
        'onion routing': 'routage en oignon',
        'routage onion': 'routage en oignon',
        'routage des oignons': 'routage en oignon',
        'routage de l\'oignon': 'routage en oignon',
        'routage d\'oignon': 'routage en oignon',
        '\\(simplifié\\)': '(de manière simplifiée)',
        'comme indiqué': 'comme illustré',
        ' crypter': ' encrypter',
        ' crypté': ' encrypté',
        'paquet onion': 'paquet oignon',
        'graphe de canal': 'graphe de canaux',
        'graphique de canal': 'graphe de canaux',
        'graphique des chaînes': 'graphe de canaux',
        'channel graph': 'graphe de canaux',
        '([gG])raphique d[eu]s? cana(l|ux)': '$1raphe de canaux',
        'd(\'|&quot;|&#39;)homologue(s)?': 'de pair$2',
        'de la graine DNS': 'du seed DNS',
        'la graine DNS': 'le seed DNS',
        'de la pathfinding': 'du pathfinding',
        'd\'essais et d\'erreurs': 'd\'essais-et-d\'erreurs',
        'encadrement': 'tramage',
        'Encadrement': 'Tramage',
        'cadrage': 'tramage',
        'Cadrage': 'Tramage',
        'de trame': 'de tramage',
        'câble': 'fil',
        'bit(s?) de fonction(s?)\\b': 'bit$1 de fonctionnalité$2',
        'répondeur': 'répondant',
        'prise de contact': 'poignée de main',
        'résumé': 'digest',
        '\\wchiffrer': 'encrypter',
        '\\wchiffré(s?)': 'encrypté$1',
        'Chiffrement': 'Encryptage',
        '\\wchiffrement': 'encryptage',
        'déchiffrer': 'décrypter',
        'déchiffré(s?)': 'décrypté$1',
        'Déchiffrement': 'Décryptage',
        'déchiffrement': 'décryptage',
        'paiement éclair': 'paiement Lightning',
        'lisible par l(\'|&quot;|&#39;)homme': 'lisible par l\'humain',
        'vie privée': 'confidentialité',
        'anonymat défini': 'ensemble d\'anonymat',
        'l(\'|&quot;|&#39;)équilibre': 'le solde',
        'réseaux sans échelle': 'réseaux invariant d\'échelle',
    };

    // Replace numbered HTML entities with Unicode characters and listed named entities
    function replaceSpecialCharacters(text) {
        return text.replace(/&#[0-9]+;/g, (match) => {
            return String.fromCharCode(match.substring(2, match.length - 1));
        }).replace(/&\w+;/g, (match) => {
            return namedEntities[match] || match;
        });
    }

    // Replace glossary terms.
    function replaceTerms(text) {
        Object.keys(termReplacements).forEach(term => {
            text = text.replace(new RegExp(term, 'g'), termReplacements[term]);
        });
        return text;
    }

    // Clean the content of the currently focused form element.
    function cleanTranslatedText() {
        // get the active element
        const activeElement = document.activeElement;
        let content;
        let convertedContent;

        // Check if the active element is a textarea or an editable element
        if (activeElement.tagName.toLowerCase() === 'textarea' || activeElement.contentEditable === 'true') {
            content = activeElement[activeElement.tagName.toLowerCase() === 'textarea' ? 'value' : 'innerHTML'];
            convertedContent = replaceSpecialCharacters(content);
            convertedContent = replaceTerms(convertedContent);
            activeElement[activeElement.tagName.toLowerCase() === 'textarea' ? 'value' : 'innerHTML'] = convertedContent;
        }
    }

    // Delimited text Ctlr + mouse click selector
    // TODO: Support text content that is spanning over multiple HTML tags (e.g. split due to a rendered &nbsp;)
    function selectDelimitedText(e) {
        if (!e.ctrlKey) {
            return
        }
        // Define the list of delimiter pairs
        var delimiterPairs = [
            { start: "<<", end: ">>" },
            { start: "(((", end: ")))" },
            { start: "https", end: "\]" },
            { start: "pass:[", end: "]" },
        ];

        // Get the text cursor position
        var textCursorPos = window.getSelection().getRangeAt(0).startOffset;

        // Get the text content of the source string element
        var elementText = e.target.textContent;

        // Find the delimiter pair that was clicked
        var clickedDelimiterPair = null;
        for (var i = 0; i < delimiterPairs.length; i++) {
            var delimiterPair = delimiterPairs[i];
            var startIndex = elementText.lastIndexOf(delimiterPair.start, textCursorPos);
            if (
                startIndex != -1 &&
                elementText.slice(startIndex, textCursorPos).indexOf(delimiterPair.end) === -1
            ) {
                clickedDelimiterPair = delimiterPair;
                break;
            }
        }

        // If no delimiter pair was clicked, return
        if (clickedDelimiterPair === null) {
            return;
        }

        // Get the start index of the delimited string
        startIndex = elementText.lastIndexOf(
            clickedDelimiterPair.start,
            textCursorPos
        );
        while (
            elementText.substr(
                Math.max(startIndex - clickedDelimiterPair.end.length, 0),
                clickedDelimiterPair.end.length
            ) == clickedDelimiterPair.end
        ) {
            startIndex = elementText.lastIndexOf(
                clickedDelimiterPair.start,
                Math.max(startIndex - clickedDelimiterPair.end.length)
            );
        }

        // Get the end index of the delimited string
        var endIndex = elementText.indexOf(clickedDelimiterPair.end, textCursorPos);
        while (
            elementText.substr(
                Math.min(endIndex + clickedDelimiterPair.start.length, elementText.length),
                clickedDelimiterPair.start.length
            ) == clickedDelimiterPair.start
        ) {
            endIndex = elementText.indexOf(
                clickedDelimiterPair.end,
                Math.min(endIndex + clickedDelimiterPair.start.length, elementText.length)
            );
        }
        endIndex += clickedDelimiterPair.end.length;

        // Set the selection range
        var range = document.createRange();
        range.setStart(e.target.firstChild, startIndex);
        range.setEnd(e.target.firstChild, endIndex);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }


    // Listen for the Ctrl+E key combination to clean the content of the currently focused form element.
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault(); // Prevent the default behavior of the Ctrl+E shortcut
            cleanTranslatedText();
        }
    });

    document.getElementById("source-string").addEventListener("click", selectDelimitedText);
    document.getElementById("translated-string").addEventListener("click", selectDelimitedText);
})();
