import {getObjectTypedKeys} from 'augment-vir';
import languages from 'language-map';
import {extname} from 'path';

export type LanguageName = keyof typeof languages;

// extension -> language name pairs that must be excluded
const languageExcludeFilters: {[extension: string]: LanguageName[]} = {
    '.md': ['GCC Machine Description'],
};

// extensions that will never match any other language name
const requiredLanguageExtension: Partial<Record<LanguageName, string>> = {
    XML: '.xml',
};

export function getFileLanguageName(fileName: string): LanguageName | undefined {
    const extension = extname(fileName);

    const matchedLanguageNames: LanguageName[] = getObjectTypedKeys(languages).filter(
        (languageName) => {
            const languageData = languages[languageName];

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

            const exclusions = languageExcludeFilters[extension];

            if (exclusions && exclusions.includes(languageName)) {
                return false;
            }

            return languageData.extensions.includes(extension);
        },
    );

    if (matchedLanguageNames.length > 1) {
        console.warn(
            `Multiple languages for code block were matched for "${fileName}": ${matchedLanguageNames.join(
                ', ',
            )}`,
        );
    }

    return matchedLanguageNames[0];
}
