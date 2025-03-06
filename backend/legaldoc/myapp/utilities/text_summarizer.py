# import torch
# import logging
# import re
# import nltk
# from transformers import AutoTokenizer, AutoModelForPreTraining, pipeline
# from nltk.tokenize import sent_tokenize

# # Download required NLTK data
# try:
#     nltk.data.find('tokenizers/punkt')
# except LookupError:
#     nltk.download('punkt',quiet=True)

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("legal_bert_simplifier")


# class LegalBertSimplifier:
#     def __init__(self, device=None, max_length=512):


#         """
#         Initialize a legal text simplifier using InLegalBERT.

#         Args:
#             device (str): Computing device ('cpu', 'cuda', or None for auto-detection)
#             max_length (int): Maximum sequence length for the model
#         """


#         # Auto-detect device if not specified
#         if device is None:
#             self.device = "cuda" if torch.cuda.is_available() else "cpu"
#         else:
#             self.device = device

#         logger.info(f"Using device: {self.device}")

#         try:
#             logger.info("Loading InLegalBERT model...")
#             self.tokenizer = AutoTokenizer.from_pretrained("law-ai/InLegalBERT")
#             self.model = AutoModelForPreTraining.from_pretrained("law-ai/InLegalBERT")
#             self.model.to(self.device)

#             # Create fill-mask pipeline for term replacement
#             self.fill_mask = pipeline(
#                 "fill-mask",
#                 model=self.model,
#                 tokenizer=self.tokenizer,
#                 device=0 if self.device == "cuda" else -1
#             )

#             # Load simplification dictionary for legal terms
#             self.legal_terms = self._load_legal_terms()

#             logger.info("Model loaded successfully")

#         except Exception as e:
#             logger.error(f"Error loading model: {str(e)}")
#             raise Exception(f"Failed to load model: {str(e)}")

#         self.max_length = max_length

#     def _load_legal_terms(self):
#         """Load common legal terms and their simpler equivalents."""
#         return {
#             "hereinafter": "from now on",
#             "aforementioned": "mentioned earlier",
#             "pursuant to": "according to",
#             "in accordance with": "following",
#             "notwithstanding": "despite",
#             "whereby": "by which",
#             "herein": "in this document",
#             "therein": "in that",
#             "heretofore": "until now",
#             "party of the first part": "first party",
#             "party of the second part": "second party",
#             "shall": "will",
#             "such": "this",
#             "said": "the",
#             "deemed to be": "considered as",
#             # Add more legal terms as needed
#         }

#     def simplify_text(self, text, level=2):
#         """
#         Simplify legal text using InLegalBERT and rule-based techniques.

#         Args:
#             text (str): Legal text to simplify
#             level (int): Simplification level (1=mild, 2=moderate, 3=extreme)

#         Returns:
#             str: Simplified text
#         """
#         if not text:
#             return ""

#         # Process the text in sentences to maintain structure
#         sentences = sent_tokenize(text)
#         simplified_sentences = []

#         for sentence in sentences:
#             # Apply different simplification techniques based on level
#             simplified = sentence

#             # Level 1: Basic term replacement
#             if level >= 1:
#                 simplified = self._replace_legal_terms(simplified)

#             # Level 2: Add structural simplification
#             if level >= 2:
#                 simplified = self._simplify_structure(simplified)

#             # Level 3: Use model to suggest simpler alternatives for complex phrases
#             if level >= 3:
#                 simplified = self._model_based_simplification(simplified)

#             simplified_sentences.append(simplified)

#         # Join the simplified sentences
#         result = ' '.join(simplified_sentences)

#         # Clean up spacing and punctuation
#         result = self.clean_text(result)

#         return result

#     def _replace_legal_terms(self, text):
#         """Replace common legal terms with simpler equivalents."""
#         for term, replacement in self.legal_terms.items():
#             # Use word boundaries to avoid partial matches
#             pattern = r'\b' + re.escape(term) + r'\b'
#             text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

#         return text

#     def _simplify_structure(self, text):
#         """Simplify the structure of legal sentences."""
#         # Remove parenthetical expressions that are longer than 20 characters
#         text = re.sub(r'\([^)]{20,}\)', '', text)

#         # Replace semicolons with periods
#         text = text.replace(';', '.')

#         # Simplify "if and only if" constructions
#         text = text.replace("if and only if", "only if")

#         # Break up sentences with multiple clauses connected by "whereas"
#         text = text.replace("WHEREAS,", ".")
#         text = text.replace("whereas,", ".")

#         # Simplify "for the purpose of"
#         text = text.replace("for the purpose of", "to")

#         return text

#     def _model_based_simplification(self, text):
#         """Use InLegalBERT to identify and simplify complex terms."""
#         # This is a simplified implementation using the mask filling capability
#         # We'll look for complex words (>7 characters) and try to find simpler alternatives

#         words = text.split()
#         simplified_words = []

#         for word in words:
#             # Skip short words, punctuation, and already processed terms
#             if len(word) <= 7 or not word.isalpha() or word.lower() in self.legal_terms:
#                 simplified_words.append(word)
#                 continue

#             # Try to find a simpler alternative using the model
#             try:
#                 # Create a masked version of the text
#                 masked_text = text.replace(word, self.tokenizer.mask_token, 1)

#                 # Get model predictions
#                 predictions = self.fill_mask(masked_text)

#                 # Filter predictions to find simpler words
#                 simpler_alternatives = [
#                     pred['token_str'] for pred in predictions
#                     if len(pred['token_str']) < len(word) and pred['score'] > 0.05
#                 ]

#                 if simpler_alternatives:
#                     # Use the highest-scoring simpler alternative
#                     simplified_words.append(simpler_alternatives[0])
#                 else:
#                     simplified_words.append(word)

#             except Exception:
#                 # If there's any issue, keep the original word
#                 simplified_words.append(word)

#         return ' '.join(simplified_words)

#     def clean_text(self, text):
#         """Clean up the simplified text."""
#         # Fix spacing
#         text = re.sub(r'\s+', ' ', text)

#         # Fix punctuation spacing
#         text = re.sub(r'\s([,.;:?!])', r'\1', text)

#         # Ensure proper spacing after punctuation
#         text = re.sub(r'([,.;:?!])([^\s])', r'\1 \2', text)

#         # Fix multiple periods
#         text = re.sub(r'\.{2,}', '.', text)

#         # Fix cases where we replace beginning of sentence
#         text = re.sub(r'\.\s+([a-z])', lambda m: f". {m.group(1).upper()}", text)

#         return text.strip()

#     def batch_simplify(self, documents, level=2):
#         """
#         Simplify multiple documents.

#         Args:
#             documents (list): List of text documents to simplify
#             level (int): Simplification level

#         Returns:
#             list: List of simplified documents
#         """
#         return [self.simplify_text(doc, level) for doc in documents]


# # Example usage
# def summarize_text(text):
#     # Create the simplifier
#     simplifier = LegalBertSimplifier()



#     # Simplify at each level
#     simplified_corpus = ''
#     for level in [1, 2, 3]:
#         print(f"\n--- Simplification Level {level} ---")
#         simplified = simplifier.simplify_text(text, level=level)
#         simplified_corpus = simplified_corpus + simplified
#         print(simplified)
#         print("-" * 50)
#     result = {
#         'original_text' : text,
#         'simplified_text' : simplified_corpus
#     }
#     return result


import torch
import logging
import re
import nltk
import datetime
from transformers import AutoTokenizer, AutoModelForPreTraining, pipeline
from nltk.tokenize import sent_tokenize


# With this inline implementation:
class NumericalDictionaries:
    @staticmethod
    def get_dictionaries():
        # Basic number words
        number_words = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
            'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
            'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
            'seventy': 70, 'eighty': 80, 'ninety': 90
        }

        # Add capitalized versions
        capitalized = {word.capitalize(): value for word, value in number_words.items()}
        number_words.update(capitalized)

        # Add magnitude words
        magnitude_words = {
            'hundred': 100,
            'thousand': 1000,
            'million': 1000000,
            'billion': 1000000000,
            'trillion': 1000000000000
        }

        # Add capitalized versions of magnitude words
        magnitude_capitalized = {word.capitalize(): value for word, value in magnitude_words.items()}
        magnitude_words.update(magnitude_capitalized)

        # Add common date words
        date_words = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12
        }

        # Add capitalized versions of month names
        date_capitalized = {word.capitalize(): value for word, value in date_words.items()}
        date_words.update(date_capitalized)

        # Format patterns for numbers, dates, and currency across simplification levels
        format_patterns = {
            # Level 1 patterns (maintain formality)
            1: {
                'date': '{month} {day}, {year}',
                'money': '{words} Dollars (${amount})',
                'money_simple': '${amount}',
                'number_with_unit': '{number} ({digit}) {unit}',
                'number': '{number} ({digit})'
            },

            # Level 2 patterns (moderate simplification)
            2: {
                'date': '{month} {day}, {year}',
                'money': '${amount} ({words} Dollars)',
                'money_simple': '${amount}',
                'number_with_unit': '{digit} {unit}',
                'number': '{digit}'
            },

            # Level 3 patterns (maximum simplification)
            3: {
                'date': '{digit_month}/{day}/{year}',
                'money': '${amount}',
                'money_simple': '${amount}',
                'number_with_unit': '{digit} {unit}',
                'number': '{digit}'
            }
        }

        return {
            'numbers': number_words,
            'magnitudes': magnitude_words,
            'dates': date_words,
            'patterns': format_patterns
        }


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("legal_bert_simplifier")


class LegalBertSimplifier:
    def __init__(self, device=None, max_length=512):
        """
        Initialize a legal text simplifier using InLegalBERT.

        Args:
            device (str): Computing device ('cpu', 'cuda', or None for auto-detection)
            max_length (int): Maximum sequence length for the model
        """
        # Auto-detect device if not specified
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        logger.info(f"Using device: {self.device}")

        # Download NLTK data safely
        try:
            nltk.download('punkt', quiet=True)
            logger.info("NLTK punkt downloaded successfully")
        except Exception as e:
            logger.warning(f"Failed to download NLTK punkt: {str(e)}")

        # Initialize optional dependencies
        self.wordnet_available = False
        self.spacy_available = False

        # Try to load WordNet (but don't fail if it's not available)
        try:
            nltk.download('wordnet', quiet=True)
            from nltk.corpus import wordnet
            self.wordnet = wordnet
            self.wordnet_available = True
            logger.info("WordNet loaded successfully")
        except Exception as e:
            logger.warning(f"WordNet not available: {str(e)}. Word simplification will be limited.")

        # Try to load spaCy (but don't fail if it's not available)
        try:
            import spacy
            self.nlp = spacy.load("en_core_web_sm")
            self.spacy_available = True
            logger.info("spaCy model loaded successfully")
        except Exception as e:
            logger.warning(f"spaCy model not available: {str(e)}. Some advanced features will be disabled.")

        try:
            logger.info("Loading InLegalBERT model...")
            self.tokenizer = AutoTokenizer.from_pretrained("law-ai/InLegalBERT")
            self.model = AutoModelForPreTraining.from_pretrained("law-ai/InLegalBERT")
            self.model.to(self.device)

            # Create fill-mask pipeline for term replacement
            self.fill_mask = pipeline(
                "fill-mask",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if self.device == "cuda" else -1
            )

            # Load simplification dictionaries for legal terms
            self.legal_terms = {
                'mild': self._load_legal_terms(1),
                'moderate': self._load_legal_terms(2),
                'extreme': self._load_legal_terms(3)
            }

            # Load numerical dictionaries
            self.num_words = NumericalDictionaries.get_dictionaries()

            logger.info("Model loaded successfully")

        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise Exception(f"Failed to load model: {str(e)}")

        self.max_length = max_length

    def _load_legal_terms(self, level):
        """
        Load common legal terms and their simpler equivalents.
        Different levels have different dictionaries with increasing simplicity.

        Args:
            level (int): 1=mild, 2=moderate, 3=extreme simplification
        """
        # Base dictionary for level 1 (mild simplification)
        if level == 1:
            return {
                "hereinafter": "hereafter",
                "aforementioned": "previously mentioned",
                "pursuant to": "according to",
                "in accordance with": "according to",
                "notwithstanding": "despite",
                "whereby": "by which",
                "herein": "in this document",
                "therein": "in that",
                "heretofore": "until now",
                "party of the first part": "first party",
                "party of the second part": "second party",
                "prior to": "before",
                "subsequent to": "after",
                "commence": "begin",
                "terminate": "end",
            }

        # Level 2 (moderate) includes level 1 terms plus more
        elif level == 2:
            terms = self._load_legal_terms(1).copy()  # Use copy to avoid modifying level 1 dict
            terms.update({
                "hereinafter": "from now on",
                "aforementioned": "mentioned earlier",
                "shall": "will",
                "such": "this",
                "said": "the",
                "deemed to be": "considered as",
                "in the event that": "if",
                "for the purpose of": "to",
                "in respect of": "for",
                "endeavor": "try",
                "transmit": "send",
                "utilize": "use",
                "forthwith": "immediately",
                "constitute": "form",
                "ascertain": "find out",
                "effectuate": "carry out",
                "in lieu of": "instead of",
                "inter alia": "among other things",
                "per annum": "yearly",
            })
            return terms

        # Level 3 (extreme) includes level 2 terms plus even more simplified terms
        elif level == 3:
            terms = self._load_legal_terms(2).copy()  # Use copy to avoid modifying level 2 dict
            terms.update({
                "hereinafter": "now on",
                "aforementioned": "just mentioned",
                "pursuant to": "under",
                "in accordance with": "following",
                "notwithstanding": "even though",
                "whereby": "where",
                "herein": "here",
                "therein": "there",
                "shall": "must",
                "such": "the",
                "said": "this",
                "utilize": "use",
                "endeavor": "try",
                "prior to": "before",
                "subsequent to": "after",
                "heretofore": "before now",
                "hereunder": "under this",
                "thereunder": "under that",
                "wherefore": "so",
                "whereas": "since",
                "therewith": "with that",
                "thereto": "to that",
                "herewith": "with this",
                "forthwith": "now",
                "hitherto": "until now",
                "hereof": "of this",
                "thereof": "of that",
                "wherein": "where",
                "whereupon": "then",
                "whosoever": "whoever",
                "whatsoever": "whatever",
                "howsoever": "however",
                "whensoever": "whenever",
                "whomsoever": "whoever",
                "wheresoever": "wherever",
                "mutatis mutandis": "with necessary changes",
                "sui generis": "unique",
                "de jure": "by law",
                "de facto": "in fact",
                "ab initio": "from the start",
                "bona fide": "genuine",
                "ultra vires": "beyond power",
                "prima facie": "at first sight",
                "force majeure": "unexpected circumstances",
                "pro rata": "proportionally",
            })
            return terms

        return {}

    def get_synonyms(self, word, simplicity_level=1):
        """
        Get simpler synonyms for a word based on simplicity level.
        Falls back to a simple dictionary if WordNet is not available.

        Args:
            word (str): Word to find synonyms for
            simplicity_level (int): 1=slightly simpler, 2=simpler, 3=simplest

        Returns:
            str or None: A simpler synonym or None if no suitable synonym is found
        """
        # Clean the word from punctuation
        clean_word = re.sub(r'[^\w\s]', '', word).lower()
        if not clean_word or len(clean_word) <= 3:
            return None

        # Fallback dictionary for complex words if WordNet is not available
        fallback_dict = {
            "accordingly": "so",
            "additional": "more",
            "adjacent": "next to",
            "advantageous": "helpful",
            "aggregate": "total",
            "alternative": "choice",
            "approximately": "about",
            "assistance": "help",
            "authorization": "approval",
            "compensation": "payment",
            "completion": "end",
            "concerning": "about",
            "consequently": "so",
            "consideration": "payment",
            "demonstrate": "show",
            "determine": "decide",
            "diminish": "reduce",
            "discretion": "choice",
            "effective": "working",
            "equivalent": "equal",
            "established": "set up",
            "evidenced": "shown",
            "exclusively": "only",
            "expeditiously": "quickly",
            "facilitate": "help",
            "formulated": "made",
            "frequently": "often",
            "fundamental": "basic",
            "generate": "make",
            "illustrate": "show",
            "immediately": "now",
            "implement": "carry out",
            "indicate": "show",
            "individual": "person",
            "initiate": "start",
            "insufficient": "not enough",
            "interrogate": "question",
            "jurisdiction": "authority",
            "limitation": "limit",
            "magnitude": "size",
            "methodology": "method",
            "modification": "change",
            "negotiate": "discuss",
            "notification": "notice",
            "obligation": "duty",
            "observe": "see",
            "occasionally": "sometimes",
            "participate": "take part",
            "particulars": "details",
            "prerequisite": "needed",
            "previously": "before",
            "primary": "main",
            "principal": "main",
            "prohibit": "ban",
            "provision": "term",
            "reasonable": "fair",
            "reconsider": "review",
            "regulations": "rules",
            "reimburse": "repay",
            "remuneration": "payment",
            "represent": "stand for",
            "request": "ask",
            "requirement": "need",
            "residence": "home",
            "restricted": "limited",
            "satisfactory": "good enough",
            "specified": "named",
            "subsequent": "later",
            "substantial": "large",
            "sufficient": "enough",
            "suitable": "fit",
            "terminate": "end",
            "transaction": "deal",
            "ultimately": "finally",
            "undertake": "do",
            "uniform": "same",
            "unilateral": "one-sided",
            "utilization": "use",
            "validate": "confirm",
            "variation": "change",
            "verification": "proof",
        }

        # If WordNet is available, use it
        if self.wordnet_available:
            synonyms = []
            for syn in self.wordnet.synsets(clean_word):
                for lemma in syn.lemmas():
                    if lemma.name().lower() != clean_word:
                        synonyms.append(lemma.name().lower())

            if not synonyms:
                # Fall back to dictionary if no synonyms found
                if clean_word in fallback_dict:
                    return fallback_dict[clean_word]
                return None

            # Remove duplicates
            synonyms = list(set(synonyms))

            # Sort by length (shorter = simpler)
            synonyms.sort(key=len)

            # Return based on simplicity level
            if simplicity_level == 1:
                # For level 1, find a synonym that's not too different in length
                for syn in synonyms:
                    if len(syn) <= len(clean_word) and len(syn) >= len(clean_word) - 2:
                        return syn.replace('_', ' ')
            elif simplicity_level == 2:
                # For level 2, find a somewhat shorter synonym
                for syn in synonyms:
                    if len(syn) <= len(clean_word) - 1:
                        return syn.replace('_', ' ')
            elif simplicity_level == 3:
                # For level 3, get the shortest synonym
                if synonyms and len(synonyms[0]) < len(clean_word):
                    return synonyms[0].replace('_', ' ')
        else:
            # If WordNet is not available, use the fallback dictionary
            if clean_word in fallback_dict:
                return fallback_dict[clean_word]

        return None

    def simplify_text(self, text, level=2, return_dict=False):
        """
        Simplify legal text using InLegalBERT and rule-based techniques.

        Args:
            text (str): Legal text to simplify
            level (int): Simplification level (1=mild, 2=moderate, 3=extreme)
            return_dict (bool): If True, returns a dictionary with structured info

        Returns:
            str or dict: Simplified text or dictionary with structured information
        """
        if not text:
            return "" if not return_dict else {}

        # Store original text
        original_text = text

        # Validate level
        level = max(1, min(3, level))  # Ensure level is between 1 and 3

        # Process the text in sentences to maintain structure
        try:
            sentences = sent_tokenize(text)
        except Exception as e:
            logger.warning(f"Error in sentence tokenization: {str(e)}. Falling back to period-based splitting.")
            sentences = text.split('.')
            sentences = [s.strip() + '.' for s in sentences if s.strip()]

        simplified_sentences = []
        original_to_simplified = {}  # Map original sentences to simplified versions
        replaced_terms = {}  # Track replaced terms for dictionary output

        for sentence in sentences:
            # Apply different simplification techniques based on level
            simplified = sentence
            original_sentence = sentence

            # Track replacements for this sentence
            sentence_replacements = {}

            # Level 1-3: Basic term replacement with increasingly simpler terms
            level_key = {1: 'mild', 2: 'moderate', 3: 'extreme'}[level]

            # Track legal term replacements
            for term, replacement in self.legal_terms[level_key].items():
                pattern = r'\b' + re.escape(term) + r'\b'
                if re.search(pattern, simplified, re.IGNORECASE):
                    sentence_replacements[term] = replacement

            simplified = self._replace_legal_terms(simplified, self.legal_terms[level_key])

            # Level 2-3: Add structural simplification
            if level >= 2:
                simplified = self._simplify_structure(simplified, level)

            # Level 3: Use model to suggest simpler alternatives for complex words
            if level >= 3:
                try:
                    # Only use model-based simplification if there are complex words
                    if any(len(word) > 7 for word in simplified.split() if word.isalpha()):
                        # Track complex words before simplification
                        complex_words = [word for word in simplified.split()
                                         if word.isalpha() and len(word) > 7]

                        simplified = self._model_based_simplification(simplified)

                        # Add complex word replacements to the tracking dictionary
                        for word in complex_words:
                            if word not in simplified and word not in sentence_replacements:
                                # Find best guess at what it was replaced with
                                for new_word in simplified.split():
                                    if new_word.isalpha() and len(new_word) < len(word):
                                        sentence_replacements[word] = new_word
                                        break
                except Exception as e:
                    logger.warning(f"Error in model-based simplification: {str(e)}. Skipping this step.")

                # Try to simplify complex words with additional methods
                complex_words_before = simplified.split()
                simplified = self._replace_complex_words(simplified, level)
                complex_words_after = simplified.split()

                # Track complex word replacements
                if len(complex_words_before) == len(complex_words_after):
                    for i, (before, after) in enumerate(zip(complex_words_before, complex_words_after)):
                        if before != after and before not in sentence_replacements:
                            sentence_replacements[before] = after

            simplified_sentences.append(simplified)
            original_to_simplified[original_sentence] = simplified

            # Add this sentence's replacements to the overall tracking dictionary
            for term, replacement in sentence_replacements.items():
                if term not in replaced_terms:
                    replaced_terms[term] = replacement

        # Join the simplified sentences
        result = ' '.join(simplified_sentences)

        # Track numerical replacements before formatting
        numerical_patterns_before = re.findall(
            r'\b(?:(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve)\s+(?:\(\d+\))?|(?:\$\d+,\d+)|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,\s+\d{4})\b',
            result, re.IGNORECASE)

        # Reformat numerical values based on simplification level
        result = self._format_numerical_values(result, level)

        # Track numerical replacements after formatting
        numerical_patterns_after = re.findall(
            r'\b(?:(?:\d+\s+(?:months|days|years))|(?:\$\d+,\d+)|(?:\d+/\d+/\d{4}))\b', result)

        # Match numerical patterns before and after if possible
        numerical_replacements = {}
        if len(numerical_patterns_before) == len(numerical_patterns_after):
            for before, after in zip(numerical_patterns_before, numerical_patterns_after):
                numerical_replacements[before] = after

        # Clean up spacing and punctuation
        result = self.clean_text(result, level)

        # For extreme simplification, break up long sentences further
        if level == 3:
            result = self._break_long_sentences(result)

        # Return just the text if dictionary not requested
        if not return_dict:
            return result

        # Prepare structured output dictionary
        output = {
            'original_text': self.clean_text(original_text),
            'simplified_text': result,
            'simplification_level': level,
            'level_name': level_key,
            'sentence_mapping': original_to_simplified,
            'replacements': {
                'legal_terms': replaced_terms,
                'numerical_values': numerical_replacements
            },
            'metadata': {
                'total_sentences': len(sentences),
                'total_words_original': len(original_text.split()),
                'total_words_simplified': len(result.split()),
                'simplification_ratio': len(result.split()) / (len(original_text.split()) or 1),
                'simplification_date': datetime.datetime.now().isoformat()
            }
        }

        return output

    def _replace_legal_terms(self, text, terms_dict):
        """
        Replace common legal terms with simpler equivalents.

        Args:
            text (str): Text to process
            terms_dict (dict): Dictionary of terms to replace

        Returns:
            str: Text with replaced terms
        """
        if not terms_dict:
            return text

        # Sort terms by length (descending) to replace longer phrases first
        sorted_terms = sorted(terms_dict.items(), key=lambda x: len(x[0]), reverse=True)

        for term, replacement in sorted_terms:
            # Use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(term) + r'\b'
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        return text

    def _simplify_structure(self, text, level):
        """
        Simplify the structure of legal sentences.

        Args:
            text (str): Text to simplify
            level (int): Simplification level

        Returns:
            str: Simplified text
        """
        # Basic simplifications for level 2
        if level == 2:
            # Remove short parenthetical expressions
            text = re.sub(r'\([^)]{10,30}\)', '', text)

            # Replace semicolons with periods if they separate distinct clauses
            text = re.sub(r';\s+([A-Z])', r'. \1', text)

            # Simplify "if and only if" constructions
            text = text.replace("if and only if", "only if")

            # Break up sentences with "whereas" clauses
            text = re.sub(r'WHEREAS,\s+', '', text, flags=re.IGNORECASE)

            # Simplify "for the purpose of"
            text = text.replace("for the purpose of", "to")

        # More aggressive simplifications for level 3
        if level == 3:
            # Remove most parenthetical expressions
            text = re.sub(r'\([^)]+\)', '', text)

            # Replace all semicolons with periods
            text = text.replace(';', '.')

            # Remove legal headers
            text = re.sub(r'WHEREAS,.*?[.;]', '', text, flags=re.IGNORECASE | re.DOTALL)
            text = re.sub(r'NOW, THEREFORE,.*?[.;]', '', text, flags=re.IGNORECASE | re.DOTALL)

            # Remove legal paragraph numbering
            text = re.sub(r'\d+\.\s+([A-Z])', r'\1', text)

            # Replace complex conjunctions
            text = text.replace("provided, however, that", "but")
            text = text.replace("provided that", "if")
            text = text.replace("in the event that", "if")

            # Replace passive voice if spaCy is available
            if self.spacy_available:
                text = self._convert_passive_to_active(text)

        return text

    def _convert_passive_to_active(self, text):
        """
        Attempt to convert passive voice to active voice using spaCy.
        Only converts simple passive constructions.

        Args:
            text (str): Text in passive voice

        Returns:
            str: Text converted to active voice where possible
        """
        if not self.spacy_available:
            return text

        try:
            doc = self.nlp(text)
            result = text

            # Look for passive voice constructions
            for sent in doc.sents:
                # Simple passive voice detection: auxiliary "be" + past participle
                be_verbs = ["is", "are", "was", "were", "be", "been", "being"]

                tokens = [token for token in sent]
                for i in range(len(tokens) - 1):
                    if (i < len(tokens) - 1 and
                            tokens[i].text.lower() in be_verbs and
                            tokens[i + 1].tag_ == "VBN" and
                            "by" in [t.text.lower() for t in tokens[i + 2:min(i + 5, len(tokens))]]):

                        # This is a potential passive construction, but we'll only attempt
                        # simple transformations to avoid creating incorrect sentences
                        passive_phrase = sent.text
                        # Find the agent (after "by")
                        by_pos = passive_phrase.lower().find(" by ")
                        if by_pos > 0:
                            parts = passive_phrase.split(" by ", 1)
                            agent = parts[1].strip()
                            before_by = parts[0].strip()

                            # Simple transformation
                            # This is very basic and will only work for simple cases
                            active_attempt = f"{agent} {tokens[i].text} {' '.join([t.text for t in tokens[i + 1:]])}"

                            # Only replace if we're confident in the transformation
                            if len(active_attempt.split()) < len(passive_phrase.split()):
                                result = result.replace(passive_phrase, active_attempt)

            return result
        except Exception as e:
            logger.warning(f"Error in passive voice conversion: {str(e)}")
            return text

    def _model_based_simplification(self, text):
        """
        Use InLegalBERT to identify and simplify complex terms.

        Args:
            text (str): Text to simplify

        Returns:
            str: Simplified text
        """
        # Skip if text is too short
        if len(text.split()) < 3:
            return text

        # This is a simplified implementation using the mask filling capability
        # We'll look for complex words (>6 characters) and try to find simpler alternatives

        words = text.split()
        simplified_words = []

        for word in words:
            # Skip short words, punctuation, and already processed terms
            if len(word) <= 6 or not re.match(r'^[a-zA-Z]+$', word):
                simplified_words.append(word)
                continue

            # Try to find a simpler alternative using the model
            try:
                # Create a masked version of the text
                context_start = max(0, words.index(word) - 5)
                context_end = min(len(words), words.index(word) + 6)
                context = " ".join(words[context_start:context_end])
                masked_text = context.replace(word, self.tokenizer.mask_token, 1)

                if len(masked_text) > self.max_length:
                    simplified_words.append(word)
                    continue

                # Get model predictions
                predictions = self.fill_mask(masked_text)

                # Filter predictions to find simpler words
                simpler_alternatives = [
                    pred['token_str'] for pred in predictions
                    if len(pred['token_str']) < len(word) and pred['score'] > 0.05
                       and not pred['token_str'].startswith('##')  # Skip subword tokens
                ]

                if simpler_alternatives:
                    # Use the highest-scoring simpler alternative
                    simplified_words.append(simpler_alternatives[0])
                else:
                    simplified_words.append(word)

            except Exception as e:
                # If there's any issue, keep the original word
                logger.debug(f"Error in model simplification for word '{word}': {str(e)}")
                simplified_words.append(word)

        return ' '.join(simplified_words)

    def _replace_complex_words(self, text, level):
        """
        Replace complex words with simpler synonyms.
        Works with or without WordNet.

        Args:
            text (str): Text to simplify
            level (int): Simplification level

        Returns:
            str: Simplified text
        """
        # Split the text into words
        words = []
        # Preserve punctuation
        for word in re.findall(r'\b[\w\']+\b|[.,;:!?()]', text):
            words.append(word)

        simplified_words = []
        skip_words = set(['the', 'and', 'or', 'but', 'on', 'in', 'at', 'to', 'for', 'with', 'by', 'of', 'a', 'an'])

        # Determine which words to simplify based on length and level
        min_length = {1: 10, 2: 8, 3: 6}[level]

        for word in words:
            if (word.lower() not in skip_words and
                    re.match(r'^[a-zA-Z]+$', word) and
                    len(word) >= min_length):

                # Try to find a simpler synonym
                synonym = self.get_synonyms(word, level)
                if synonym:
                    # Preserve capitalization
                    if word[0].isupper():
                        synonym = synonym.capitalize()
                    simplified_words.append(synonym)
                else:
                    simplified_words.append(word)
            else:
                simplified_words.append(word)

        # Reconstruct the text
        result = ''
        for i, word in enumerate(simplified_words):
            if word in '.,;:!?()':
                result += word
            elif i > 0 and simplified_words[i - 1] not in '.,;:!?(':
                result += ' ' + word
            else:
                result += word

        return result

    def _format_numerical_values(self, text, level):
        """
        Format numerical values to improve understanding based on simplification level.
        Uses the numerical dictionaries to perform consistent formatting.

        Args:
            text (str): Text to process
            level (int): Simplification level

        Returns:
            str: Text with reformatted numerical values
        """
        # Get the appropriate patterns for this level
        patterns = self.num_words['patterns'][level]

        # Helper function to convert word numbers to digits
        def word_to_number(word_str):
            """Convert word-form numbers like 'two thousand' to digits (2000)"""
            word_str = word_str.lower().strip()
            if not word_str:
                return None

            words = word_str.split()
            result = 0
            current_number = 0

            for word in words:
                clean_word = word.strip(',.;:()')

                if clean_word in self.num_words['numbers']:
                    current_number += self.num_words['numbers'][clean_word]
                elif clean_word in self.num_words['magnitudes']:
                    # Handle magnitudes (hundred, thousand, etc.)
                    magnitude = self.num_words['magnitudes'][clean_word]
                    current_number = current_number * magnitude if current_number > 0 else magnitude
                    result += current_number
                    current_number = 0

            result += current_number
            return result if result > 0 else None

        # Money pattern: "Two Thousand Dollars ($2,000.00)"
        def replace_money(match):
            amount_words = match.group(1).strip()
            dollar_amount = match.group(2)
            cents_amount = match.group(3) if match.group(3) else "00"

            # Format based on the level
            if level == 1:
                return f"{amount_words} Dollars (${dollar_amount},{cents_amount})"
            elif level == 2:
                return f"${dollar_amount},{cents_amount} ({amount_words} Dollars)"
            else:  # level 3
                return f"${dollar_amount},{cents_amount}"

        # Replace money expressions
        text = re.sub(
            r'(?:the sum of )?([A-Z][a-z]+ (?:Thousand|Hundred|Million)(?: Dollars)?)\s*\(\$(\d+),(\d+)(?:\.00)?\)',
            replace_money,
            text
        )

        # Process numbers with units (e.g., "twelve (12) months")
        def replace_number_with_unit(match):
            num_word = match.group(1)
            digit = match.group(2)
            unit = match.group(3)

            # Format based on the level
            if level == 1:
                return f"{num_word} ({digit}) {unit}"
            else:  # level 2 or 3
                return f"{digit} {unit}"

        # Replace number-unit patterns
        text = re.sub(
            r'((?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty|Thirty|Forty|Fifty|Sixty|Seventy|Eighty|Ninety)[a-z\s-]*)\s*\(\s*(\d+)\s*\)\s*([a-zA-Z]+)',
            replace_number_with_unit,
            text
        )

        # Date patterns
        def replace_date(match):
            month_name = match.group(1)
            day = match.group(2)
            year = match.group(3)

            # Get month number if it's a month name
            if month_name.lower() in self.num_words['dates']:
                month_num = self.num_words['dates'][month_name.lower()]
            else:
                month_num = month_name  # already a number

            # Format based on the level
            if level in [1, 2]:
                return f"{month_name} {day}, {year}"
            else:  # level 3
                return f"{month_num}/{day}/{year}"

        # Replace date patterns
        text = re.sub(
            r'(?:on|commencing on|beginning|starting) (January|February|March|April|May|June|July|August|September|October|November|December) (\d+), (\d{4})',
            lambda m: f"starting {replace_date(m)}",
            text,
            flags=re.IGNORECASE
        )

        # For level 3, remove all parenthetical numerical duplications
        if level == 3:
            text = re.sub(r'(\d+)\s*\(\s*\1\s*\)', r'\1', text)

        return text

    def clean_text(self, text, level=None):
        """
        Clean up the simplified text.

        Args:
            text (str): Text to clean
            level (int, optional): Simplification level for specialized formatting

        Returns:
            str: Cleaned text
        """
        # Fix spacing
        text = re.sub(r'\s+', ' ', text)

        # Fix punctuation spacing
        text = re.sub(r'\s([,.;:?!)])', r'\1', text)
        text = re.sub(r'(\()\s', r'\1', text)

        # Ensure proper spacing after punctuation
        text = re.sub(r'([,.;:?!)])([^\s])', r'\1 \2', text)

        # Fix multiple periods
        text = re.sub(r'\.{2,}', '.', text)

        # Fix cases where we replaced beginning of sentence
        text = re.sub(r'\.\s+([a-z])', lambda m: f". {m.group(1).upper()}", text)

        # Fix extra spaces after opening quotes or before closing quotes
        text = re.sub(r'"\s+', '"', text)
        text = re.sub(r'\s+"', '"', text)

        # Fix double spaces
        text = re.sub(r'\s{2,}', ' ', text)

        # Fix currency format
        text = re.sub(r'\$\s*(\d+)\s*,\s*(\d+)', r'$\1,\2', text)

        return text.strip()

    def _break_long_sentences(self, text):
        """
        Break long sentences into shorter ones for extreme simplification.

        Args:
            text (str): Text with long sentences

        Returns:
            str: Text with shorter sentences
        """
        try:
            sentences = sent_tokenize(text)
        except Exception:
            # Fallback if tokenization fails
            sentences = text.split('.')
            sentences = [s.strip() + '.' for s in sentences if s.strip()]

        result = []

        for sentence in sentences:
            # If sentence is short enough, keep it as is
            if len(sentence.split()) <= 20:
                result.append(sentence)
                continue

            # Otherwise try to break it at conjunctions
            conjunctions = [', and ', ', but ', ', or ', ', so ', ', yet ', ', nor ', ', for ', ', because ']
            parts = [sentence]

            for conj in conjunctions:
                new_parts = []
                for part in parts:
                    if conj in part.lower():
                        split_parts = part.split(conj, 1)
                        # Capitalize the first letter after the split
                        if len(split_parts) > 1 and split_parts[1]:
                            split_parts[1] = split_parts[1][0].upper() + split_parts[1][1:]
                        new_parts.extend(
                            [split_parts[0] + '.'] + [conj.lstrip(', ').capitalize() + ' ' + split_parts[1]])
                    else:
                        new_parts.append(part)
                parts = new_parts

            result.extend(parts)

        return ' '.join(result)

    def batch_simplify(self, documents, level=2, return_dict=False):
        """
        Simplify multiple documents.

        Args:
            documents (list): List of text documents to simplify
            level (int): Simplification level
            return_dict (bool): If True, returns dictionaries instead of strings

        Returns:
            list: List of simplified documents or dictionaries
        """
        return [self.simplify_text(doc, level, return_dict) for doc in documents]

    def get_metrics(self, original_text, simplified_text):
        """
        Calculate metrics about the simplification.

        Args:
            original_text (str): Original text before simplification
            simplified_text (str): Text after simplification

        Returns:
            dict: Dictionary of simplification metrics
        """
        # Basic statistics
        orig_words = len(original_text.split())
        simp_words = len(simplified_text.split())

        # Calculate average word length
        orig_avg_word_len = sum(len(word) for word in original_text.split()) / (orig_words or 1)
        simp_avg_word_len = sum(len(word) for word in simplified_text.split()) / (simp_words or 1)

        # Calculate number of long words (>6 chars)
        orig_long_words = sum(1 for word in original_text.split() if len(word) > 6)
        simp_long_words = sum(1 for word in simplified_text.split() if len(word) > 6)

        # Calculate readability scores if possible
        try:
            # Try to use textstat if available
            import textstat
            orig_flesch = textstat.flesch_reading_ease(original_text)
            simp_flesch = textstat.flesch_reading_ease(simplified_text)

            orig_grade = textstat.flesch_kincaid_grade(original_text)
            simp_grade = textstat.flesch_kincaid_grade(simplified_text)
        except ImportError:
            # Simple fallback readability calculation
            orig_flesch = 206.835 - 1.015 * (orig_words / (len(sent_tokenize(original_text)) or 1)) - 84.6 * (
                        sum(len(word) for word in original_text.split()) / (orig_words or 1) / 5)
            simp_flesch = 206.835 - 1.015 * (simp_words / (len(sent_tokenize(simplified_text)) or 1)) - 84.6 * (
                        sum(len(word) for word in simplified_text.split()) / (simp_words or 1) / 5)

            orig_grade = 0.39 * (orig_words / (len(sent_tokenize(original_text)) or 1)) + 11.8 * (
                        sum(len(word) for word in original_text.split()) / (orig_words or 1) / 5) - 15.59
            simp_grade = 0.39 * (simp_words / (len(sent_tokenize(simplified_text)) or 1)) + 11.8 * (
                        sum(len(word) for word in simplified_text.split()) / (simp_words or 1) / 5) - 15.59

        return {
            "word_count": {
                "original": orig_words,
                "simplified": simp_words,
                "reduction_percentage": round((orig_words - simp_words) / (orig_words or 1) * 100, 2)
            },
            "avg_word_length": {
                "original": round(orig_avg_word_len, 2),
                "simplified": round(simp_avg_word_len, 2),
                "reduction": round(orig_avg_word_len - simp_avg_word_len, 2)
            },
            "long_words": {
                "original": orig_long_words,
                "simplified": simp_long_words,
                "reduction_percentage": round((orig_long_words - simp_long_words) / (orig_long_words or 1) * 100, 2)
            },
            "readability": {
                "flesch_reading_ease": {
                    "original": round(orig_flesch, 2),
                    "simplified": round(simp_flesch, 2),
                    "improvement": round(simp_flesch - orig_flesch, 2)
                },
                "grade_level": {
                    "original": round(orig_grade, 2),
                    "simplified": round(simp_grade, 2),
                    "improvement": round(orig_grade - simp_grade, 2)
                }
            }
        }


def extract_numerical_values(text):
    """
    Extract numerical values from text and identify their types.

    Args:
        text (str): Text to extract values from

    Returns:
        dict: Dictionary of numerical values with their types
    """
    numerical_dict = {}

    # Regular expressions for different types of numerical values
    patterns = {
        'monetary_amount': [
            r'\$\d+(?:,\d{3})*(?:\.\d{2})?',
            r'(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty|Thirty|Forty|Fifty|Sixty|Seventy|Eighty|Ninety|Hundred|Thousand|Million|Billion|Trillion)(?:\s+(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty|Thirty|Forty|Fifty|Sixty|Seventy|Eighty|Ninety|Hundred|Thousand|Million|Billion|Trillion))*\s+Dollars'
        ],
        'date': [
            r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}',
            r'\d{1,2}/\d{1,2}/\d{4}'
        ],
        'time_period': [
            r'\d+\s+(?:day|days|month|months|year|years|week|weeks)',
            r'(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s+\(\d+\)\s+(?:day|days|month|months|year|years|week|weeks)'
        ],
        'percentage': [
            r'\d+(?:\.\d+)?%',
            r'\d+(?:\.\d+)?\s+percent'
        ],
        'paragraph_number': [
            r'^\s*\d+\.\s+[A-Z]+'
        ]
    }

    # Extract values using the patterns
    for value_type, pattern_list in patterns.items():
        for pattern in pattern_list:
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                # Clean up the match
                match_text = match.strip()

                # Add to dictionary
                numerical_dict[match_text] = {
                    'type': value_type,
                    'original_text': match_text
                }

    return numerical_dict

def summarize_text(
    text=None,
    file=None,
    level=2,
    output=None,
    highlight=False
):
    import json
    import os

    # Get input text from file or provided text
    if file:
        try:
            with open(file, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            return None
    elif not text:
        # Use sample text if no input provided
        text = """
        WHEREAS, the Party of the First Part (hereinafter referred to as 'Lessor') and the Party of the Second Part (hereinafter referred to as 'Lessee') have entered into an agreement for the lease of certain premises located at 123 Main Street;

        NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties hereby agree as follows:

        1. TERM. The Lessor hereby leases to the Lessee, and the Lessee hereby leases from the Lessor, the aforementioned premises for a term of twelve (12) months, commencing on January 1, 2025.

        2. RENT. The Lessee shall pay to the Lessor as rent for the demised premises the sum of Two Thousand Dollars ($2,000.00) per month, payable in advance on the first day of each calendar month during the term hereof.

        3. SECURITY DEPOSIT. Upon the execution of this Agreement, the Lessee shall deposit with the Lessor the sum of Three Thousand Dollars ($3,000.00) as security for the faithful performance by the Lessee of the terms hereof, to be returned to the Lessee, without interest, upon the termination of this lease and the payment of all rent due and the performance of all the Lessee's obligations hereunder.

        4. RATE INCREASE. The Lessor may increase the rent by 5% annually after the initial term.
        """
        print("Using sample legal text...")

    # Create the simplifier
    print(f"Initializing Legal BERT Simplifier...")
    simplifier = LegalBertSimplifier()

    # Simplify the text
    print(f"Simplifying text (level {level})...")
    result = simplifier.simplify_text(text, level=level, return_dict=True)

    # Extract numerical values
    if highlight:
        print("Extracting numerical values...")
        numerical_values = {}

        # Extract from original text
        original_nums = extract_numerical_values(text)
        numerical_values['original'] = original_nums

        # Extract from simplified text
        simplified_nums = extract_numerical_values(result['simplified_text'])
        numerical_values['simplified'] = simplified_nums

        # Add the numerical values to the result
        result['numerical_values'] = numerical_values

    # Print summary
    print("\n" + "=" * 50)
    print(f"Simplification Level: {level} ({result['level_name']})")
    print(f"Original Word Count: {result['metadata']['total_words_original']}")
    print(f"Simplified Word Count: {result['metadata']['total_words_simplified']}")
    print(f"Reduction: {100 - round(result['metadata']['simplification_ratio'] * 100, 1)}%")

    if highlight:
        print(f"\nNumerical Values Found:")
        print(f"  Original text: {len(numerical_values['original'])} values")
        print(f"  Simplified text: {len(numerical_values['simplified'])} values")

    # Display sample of the text
    print("\n" + "=" * 50)
    print("ORIGINAL TEXT SAMPLE:")
    print(text[:300] + "..." if len(text) > 300 else text)

    print("\n" + "=" * 50)
    print("SIMPLIFIED TEXT SAMPLE:")
    print(
        result['simplified_text'][:300] + "..." if len(result['simplified_text']) > 300 else result['simplified_text'])

    # Save to file if output specified
    if output:
        try:
            with open(output, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2)
            print(f"\nResults saved to {output}")
        except Exception as e:
            print(f"Error saving results: {e}")

    print("\n" + "=" * 50)
    if highlight and not output:
        print("\nNUMERICAL VALUES IN ORIGINAL TEXT:")
        for value, info in numerical_values['original'].items():
            print(f"  {value}: {info['type']}")

        print("\nNUMERICAL VALUES IN SIMPLIFIED TEXT:")
        for value, info in numerical_values['simplified'].items():
            print(f"  {value}: {info['type']}")

    return result

