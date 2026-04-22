import {getObjectTypedKeys} from '@augment-vir/common';
import {extname} from 'node:path';
import {type LanguageEntry, languageMap, type LanguageName} from './language-map.js';

// extensions that will never match any other language name
const requiredLanguageExtension: Partial<Record<LanguageName, string>> = {
    XML: '.xml',
};

export function getFileLanguageName(fileName: string): LanguageName | undefined {
    const extension = extname(fileName);

    const matchedLanguageNames = getObjectTypedKeys(languageMap).filter((languageName) => {
        const languageData: LanguageEntry = languageMap[languageName];

        if (!('extensions' in languageData)) {
            return false;
        }

        const requiredExtensionForLanguage = requiredLanguageExtension[languageName];
        if (
            languageName in requiredLanguageExtension &&
            requiredExtensionForLanguage !== extension
        ) {
            return false;
        }

        return languageData.extensions.includes(extension);
    });

    if (matchedLanguageNames.length > 1) {
        console.warn(
            `Multiple languages for code block were matched for '${fileName}': ${matchedLanguageNames.join(
                ', ',
            )}`,
        );
    }

    return matchedLanguageNames[0];
}
