import re, os, json
from git import Repo, rmtree  # pip install gitpython

def parse_params(file_path, file_name):
    file = open(file_path, "r")
    read = file.readlines()
    items = []
    for line in read:
        words = line.split()
        if (words):
            if '\value' in words[0]:
                break
            elif '\item' in words[0]:
                items.append(line.strip())
            else:
                if items:
                    items[-1] = items[-1] + line.strip()
    output_path = texts + '/' + file_name
    filew = open(output_path, "w")
    for item in items:
        filew.write(item + '\n')

def parse_to_JSON(file_path, file_name, root):
    pattern_var = r"\\item\{(.*?)\}"
    pattern_type = r"\}\{\w+\s*(.*?)\s"
    pattern_default = r"Default value is \\code\{[\w.]+\s*=\s*(.*?)\}"
    pattern_options = r"Options include: \s*(.*?)\."
    pattern_class = r"Class:\s*(.*?)\."
    pattern_description = r"\}\{(.*?)\."
    items = {}
    with open(file_path, 'r') as file:
        read = file.readlines()
    for line in read:
        var = None
        var_type = None
        default = None
        options = None
        section = None
        description = None
        if (re.search(pattern_var, line)):
            var = re.search(pattern_var, line).group(1)
        if (re.search(pattern_type, line)):
            var_type = re.search(pattern_type, line).group(1)
            if (var_type[-1] == ','):
                var_type = var_type[:-1]
        if (re.search(pattern_default, line)):
            default = re.search(pattern_default, line).group(1)
        if (re.search(pattern_options, line)):
            options = re.search(pattern_options, line).group(1)
        if (re.search(pattern_class, line)):
            section = re.search(pattern_class, line).group(1)
        if (re.search(pattern_description, line)):
            description = re.search(pattern_description, line).group(1)
        if (var != None):
            if ("code{" not in var):
                items[var] = {
                    "type": var_type,
                    "default": default,
                    "options": options,
                    "class": section,
                    "description": description
                }
        with open(root + '/.json/' + file_name, "w") as json_file:
            json.dump(items, json_file, indent=4)


root = os.getcwd()
if (os.path.exists(root + '/.json')):
    rmtree(root + '/.json')
path = os.getcwd() + '/plotgardener'
rmpath = os.getcwd() + '/plotgardener'
os.mkdir(path)
texts = os.getcwd() + '/texts'
if (os.path.exists(texts)):
    rmtree(texts)
os.mkdir(texts)
os.mkdir(os.getcwd() + '/.json')

# clone repo
Repo.clone_from('git@github.com:rishabhsvemuri/plotgardener.git', path)
# navigate to man folder
path += '/man' 

os.chdir(path)
for file in os.listdir():
    if '.' in file:
        file_name = file[:-3] + '.txt'
        parse_params(path + '/' + file, file_name)
os.chdir(texts)
for file in os.listdir():
    file_name = file[:-4] + '.json'
    parse_to_JSON(os.getcwd() + '/' + file, file_name, root)

# cleanup
rmtree(texts)
rmtree(rmpath)

# handle distinction between character vector, character value, vector
# data frame, vector -> disregard