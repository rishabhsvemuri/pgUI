import re, os, json
from git import Repo, rmtree
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords

# NLTK setup
nltk.download('punkt')
nltk.download('stopwords')

def extract_description(text):
    sentences = sent_tokenize(text)
    stop_words = set(stopwords.words('english'))

    if not sentences:
        return {"summary": None, "keywords": []}

    first_sentence = sentences[0]
    words = word_tokenize(first_sentence)
    keywords = [word for word in words if word.isalpha() and word.lower() not in stop_words]

    return {"summary": first_sentence, "keywords": keywords}

def parse_params(file_path, file_name, texts):
    with open(file_path, "r") as file:
        lines = file.readlines()

    items = []
    for line in lines:
        words = line.split()
        if not words:
            continue
        if '\\value' in words[0]:
            break
        elif '\\item' in words[0]:
            items.append(line.strip())
        elif items:
            items[-1] += line.strip()

    output_path = os.path.join(texts, file_name)
    with open(output_path, "w") as filew:
        filew.write('\n'.join(items))

def parse_to_JSON(file_path, file_name, output_dir):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    pattern_var = re.compile(r"\\item\{(.*?)\}")
    pattern_type = re.compile(r"\}\{\w+\s*(.*?)\s")
    pattern_default = re.compile(r"Default value is \\code\{[\w.]+\s*=\s*(.*?)\}")
    pattern_options = re.compile(r"Options include: \s*(.*?)\.")
    pattern_class = re.compile(r"Class:\s*(.*?)\.")
    pattern_description_raw = re.compile(r"\}\{(.*)")

    items = {}
    for line in lines:
        var_match = pattern_var.search(line)
        if not var_match:
            continue

        var_name = var_match.group(1)
        if "code{" in var_name:
            continue

        var_type = pattern_type.search(line)
        default = pattern_default.search(line)
        options = pattern_options.search(line)
        section = pattern_class.search(line)
        description = None
        keywords = []

        desc_match = pattern_description_raw.search(line)
        if desc_match:
            desc_data = extract_description(desc_match.group(1).strip())
            description = desc_data["summary"]
            keywords = desc_data["keywords"]

        items[var_name] = {
            "type": var_type.group(1).rstrip(',') if var_type else None,
            "default": default.group(1) if default else None,
            "options": options.group(1) if options else None,
            "class": section.group(1) if section else None,
            "description": description,
            "keywords": keywords
        }

    with open(os.path.join(output_dir, '.json', file_name), "w") as json_file:
        json.dump(items, json_file, indent=4)

def main():
    root = os.getcwd()
    repo_path = os.path.join(root, 'plotgardener')
    texts_path = os.path.join(root, 'texts')
    json_path = os.path.join(root, '.json')

    for path in [repo_path, texts_path, json_path]:
        if os.path.exists(path):
            rmtree(path)
    os.mkdir(texts_path)
    os.mkdir(json_path)

    Repo.clone_from('git@github.com:rishabhsvemuri/plotgardener.git', repo_path)
    man_path = os.path.join(repo_path, 'man')

    for file in os.listdir(man_path):
        if file.endswith('.Rd'):
            file_name = file.replace('.Rd', '.txt')
            parse_params(os.path.join(man_path, file), file_name, texts_path)

    for file in os.listdir(texts_path):
        json_file_name = file.replace('.txt', '.json')
        parse_to_JSON(os.path.join(texts_path, file), json_file_name, root)

    rmtree(texts_path)
    rmtree(repo_path)

if __name__ == "__main__":
    main()