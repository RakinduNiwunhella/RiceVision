import pandas as pd

# ==========================================================
#  DS DIVISION -> DISTRICT MAPPING
#  (Add more when you see "Unknown" in output)
# ==========================================================

DS_TO_DISTRICT = {

    # --- COLOMBO ---
    "colombo": "Colombo",
    "dehiwala": "Colombo",
    "kotte": "Colombo",
    "maharagama": "Colombo",
    "kesbewa": "Colombo",
    "moratuwa": "Colombo",
    "padukka": "Colombo",
    "homagama": "Colombo",
    "seethawaka": "Colombo",
    "kolonnawa": "Colombo",
    "kaduwela": "Colombo",
    "ratmalana": "Colombo",
    "thimbirigasyaya": "Colombo",

    # --- GAMPAHA ---
    "gampaha": "Gampaha",
    "negombo": "Gampaha",
    "katana": "Gampaha",
    "ja ela": "Gampaha",
    "ja-ela": "Gampaha",
    "wattala": "Gampaha",
    "minuwangoda": "Gampaha",
    "divulapitiya": "Gampaha",
    "mirigama": "Gampaha",
    "mahara": "Gampaha",
    "dompe": "Gampaha",
    "biyagama": "Gampaha",
    "attangalla": "Gampaha",
    "attanagalla": "Gampaha",

    # --- KALUTARA ---
    "kalutara": "Kalutara",
    "panadura": "Kalutara",
    "bandaragama": "Kalutara",
    "horana": "Kalutara",
    "ingiriya": "Kalutara",
    "bulathsinhala": "Kalutara",
    "mathugama": "Kalutara",
    "agalawatta": "Kalutara",
    "agalawaththa": "Kalutara",
    "palindanuwara": "Kalutara",
    "walallavita": "Kalutara",
    "dodangoda": "Kalutara",
    "beruwala": "Kalutara",
    "madurawala": "Kalutara",

    # --- GALLE ---
    "galle": "Galle",
    "akmeemana": "Galle",
    "baddegama": "Galle",
    "balapitiya": "Galle",
    "bentota": "Galle",
    "bope poddala": "Galle",
    "elapitiya": "Galle",
    "habaraduwa": "Galle",
    "hikkaduwa": "Galle",
    "imaduwa": "Galle",
    "karandeniya": "Galle",
    "nagoda": "Galle",
    "nelluawa": "Galle",
    "thawalama": "Galle",
    "welivitiya-divithura": "Galle",
    "yakkalamulla": "Galle",

    # --- MATARA ---
    "matara": "Matara",
    "akuressa": "Matara",
    "athuraliya": "Matara",
    "devinuwara": "Matara",
    "dikwella": "Matara",
    "hakmana": "Matara",
    "kamburupitiya": "Matara",
    "kirinda puhullwella": "Matara",
    "malimbada": "Matara",
    "pasgoda": "Matara",
    "pitabeddara": "Matara",
    "thihagoda": "Matara",
    "welipitiya": "Matara",

    # --- HAMBANTOTA ---
    "hambantota": "Hambantota",
    "ambalantota": "Hambantota",
    "beliatta": "Hambantota",
    "tissamaharama": "Hambantota",
    "sooriyawewa": "Hambantota",
    "lunugamvehera": "Hambantota",
    "katuwana": "Hambantota",
    "okotuwella": "Hambantota",
    "walasmulla": "Hambantota",

    # --- RATNAPURA ---
    "ratnapura": "Ratnapura",
    "balangoda": "Ratnapura",
    "pelmadulla": "Ratnapura",
    "kuruwita": "Ratnapura",
    "kahawatta": "Ratnapura",
    "ehaliyagoda": "Ratnapura",
    "ayagama": "Ratnapura",
    "godakawela": "Ratnapura",
    "imbulpe": "Ratnapura",
    "niwithigala": "Ratnapura",
    "opalagama": "Ratnapura",
    "kalawana": "Ratnapura",
    "kiriella": "Ratnapura",

    # --- KANDY ---
    "kandy": "Kandy",
    "delthota": "Kandy",
    "doluwa": "Kandy",
    "gangawata korale": "Kandy",
    "harispattuwa": "Kandy",
    "hatharaliyadda": "Kandy",
    "kundasale": "Kandy",
    "medadumbara": "Kandy",
    "mini pe": "Kandy",
    "panvila": "Kandy",
    "pasbage korale": "Kandy",
    "pathadumbara": "Kandy",
    "pathahewaheta": "Kandy",
    "udapalatha": "Kandy",
    "udunuwara": "Kandy",
    "yatinuvara": "Kandy",
}

# ==========================================================
# MANUAL NORMALIZATION & REMOVALS
# ==========================================================
NORMALIZE_MAP = {
    "addalachchenei":"addalachchenai",
    "agunakolapelassa":"angunakolapelessa",
    "agunukolapelassa":"angunakolapelessa",
    "alauwa":"alawwa","alauwwa":"alawwa","alawuwa":"alawwa","alawwa":"alawwa",
    "alayadiwembu":"alayadivembu",
    "ambgamuwa":"ambagamuwa",
    "aranayaka":"aranayake",
    "badalkubura":"badalkumbura",
    "badulle":"badulla",
    "bamunakotuwa":"bamunukotuwa",
    "bulathkopitiya":"bulathkohupitiya",
    "chillaw":"chilaw","chialw":"chilaw",
    "dareniyagala":"deraniyagala","daraniyagala":"deraniyagala",
    "dehiowita":"dehiovita",
    "delf":"delft",
    "dimbulgala":"dimbulagala","dibulagala":"dimbulagala",
    "elpatha":"elapatha","elapaatha":"elapatha",
    "eravur paththu":"eravur pattu","eravur pattu":"eravur pattu",
    "galnewawa":"galnewa",
    "gomarankadawela":"gomarankadawala",
    "gonapinuwela":"gonapinuwala","gonupinuwela":"gonapinuwala",
    "haaliela":"hali ela","hali ela":"hali ela","haliela":"hali ela",
    "haldumulla":"haldummulla","haldunmulla":"haldummulla",
    "haputhale":"haputale",
    "hingurakgoda":"hingurakgoda","higurakgoda":"hingurakgoda",
    "horoupathana":"horowupathana","horowpathana":"horowupathana","horowpothana":"horowupathana",
    "ipologama":"ipalogama",
    "jayawardhanapura":"sri jayawardenepura kotte",
    "kabathigollawa":"kebithigollewa","kebathigollawa":"kebithigollewa","kabithigollawa":"kabithigollewa",
    "kadawath sathara":"kadawatha sathara","kadawathsathara":"kadawatha sathara","kadawatsatara":"kadawatha sathara",
    "kaltota":"kalthota","kanthale":"kantale",
    "karativu":"karaitheevu",
    "karuwalagaaswewa":"karuwalagaswewa",
    "kebiigollewa":"kebithigollewa",
    "kobeigane":"kobaigane",
    "koralaipattu":"koralai pattu",
    "kothmale":"kotmale","kotmale":"kotmale",
    "kuchchaweli":"kuchchaveli","kuchcheweli":"kuchchaveli","kuchchuweli":"kuchchaveli",
    "kuliyapitiuya":"kuliyapitiya",
    "kurunagala":"kurunegala","kurunagela":"kurunegala",
    "laggala pallegama":"laggala pallegama",
    "madmpagama":"madampagama",
    "mahoya":"mahaoya",
    "mahiyangane":"mahiyanganaya",
    "malkauwawa":"malkadawala",
    "mantha west":"manthai west",
    "maritimepattu":"maritimepattu","miritimepattu":"maritimepattu",
    "mathale":"matale",
    "mawanelle":"mawanella","mawanwella":"mawanella",
    "meegahakiula":"meegahakiula","megahakiula":"meegahakiula",
    "mihnthale":"mihintale","mihinthalaya":"mihintale",
    "munmunai west":"manmunai west",
    "nannaddan":"nanattan","nannatan":"nanattan","nannattan":"nanattan",
    "nattandiya":"naththandiya","natthandiya":"naththandiya",
    "navithanveli":"navanthanveli",
    "nawagaththegama":"nawagattegama",
    "nikawaratiya":"nikaweratiya",
    "nuwaraeliya":"nuwara eliya",
    "oddusuddan":"oddusudan",
    "opanayaka":"opanayake",
    "pachchilaipalli":"pachchilaippalli",
    "padavi sripura":"padavi siripura","padavisripura":"padavi siripura","padawi sripura":"padavi siripura",
    "panduwasnuwara -east":"panduwasnuwara east",
    "pointpedro":"point pedro","pointpedro":"point pedro",
    "polgahwela":"polgahawela",
    "polpitigama":"polpithigama",
    "pujapitiya":"poojapitiya",
    "putthalama":"puttalam","puttalama":"puttalam",
    "rabukkana":"rambukkana",
    "raththoa":"raththota","rattota":"raththota",
    "rideemaliyedda":"rideemaliyadda",
    "ruwanwell":"ruwanwella","ruwanwelle":"ruwanwella",
    "sammanthurai":"samanthurai","samanthurei":"samanthurai",
    "sandilipay":"sandilippai","sandillipay":"sandilippai",
    "seruwila":"seruvila",
    "soranatota":"soranathota",
    "tellipaili":"tellippalai","tellippali":"tellippalai","thellipalai":"tellippalai",
    "thamankauwa":"thamankaduwa",
    "thambalagamuwa":"thambalagama",
    "thambuththegama":"thabuththegama","thambuttegama":"thabuththegama",
    "thunikkai":"thunukkai",
    "tumpame":"thumpane",
    "uduumbara":"uduvil","uduwil":"uduvil",
    "uwa paranagama":"uva paranagama","uwaparanagama":"uva paranagama",
    "vauniya north":"vavuniya north",
    "verungal":"verugal",
    "waariyapola":"wariyapola","wariyapola":"wariyapola",
    "waduraba":"wanduramba","wanduraba":"wanduramba",
    "wanathawilluwa":"wanathavilluwa","wanatnawilluwa":"wanathavilluwa",
    "weerakeiya":"weeraketiya","weraketiya":"weeraketiya",
    "willgamuwa":"wilgamuwa",
    "yatiyantota":"yatiyanthota","yatiyantyhota":"yatiyanthota",
    "kadawath sathara":"kadawatha sathara",
    "madampagama":"madampagama",
    "nachchaduwa":"nachchaduwa",
    "pannala":"pannala",
    "thumpane":"thumpane",
    "vavuniya south":"vavuniya south",
    "yatiyanthota":"yatiyanthota"
}

REMOVE_SET = set([
    "unknown","c.n.p.","e.n.p","e.n.p.","high wind","mnp","ma.nu.pa","madyama nu.pa.","n.p.e.","na.nu.pa","jp.kiy","sabaragamuwa","trincomalee","uduil","vengel","ulliduwawa","udaiyarkaddu south","mugunamana east","karalaipattu centre","koralaipattu south kiran","koralaipattu kiran","porathivupattu vellvely","seddiyarkurichchim","town & gravets","town& gravets","town & gravwts"
])

# ==========================================================
# MAIN SCRIPT
# ==========================================================

INPUT_FILE = "clean_disaster_dataset.csv"
OUTPUT_FILE = "clean_disaster_dataset_with_district.csv"

print("Reading dataset...")
df = pd.read_csv(INPUT_FILE)

# Normalize DS names
raw = df["ds_division"].astype(str).str.lower().str.strip()
raw = raw.replace(NORMALIZE_MAP)
# remove non-DS rows
df = df[~raw.isin(REMOVE_SET)].copy()
df["ds_clean"] = raw[~raw.isin(REMOVE_SET)]

# ---------------- AUTO CORRECT SPELLINGS ----------------
from difflib import get_close_matches

official_names = list(DS_TO_DISTRICT.keys())


def resolve_district(name):
    # direct match
    if name in DS_TO_DISTRICT:
        return DS_TO_DISTRICT[name]

    # fuzzy match for misspellings
    match = get_close_matches(name, official_names, n=1, cutoff=0.78)
    if match:
        return DS_TO_DISTRICT[match[0]]

    return "Unknown"


df["district"] = df["ds_clean"].apply(resolve_district)

unknown = (df["district"] == "Unknown").sum()

# ---------------- SECOND PASS: LEARN FROM DATA ----------------
# If a DS spelling appears elsewhere with a known district, reuse it
from difflib import SequenceMatcher

# Build lookup from known rows
known_rows = df[df["district"] != "Unknown"]
known_map = (
    known_rows.groupby("ds_clean")["district"]
    .agg(lambda x: x.value_counts().index[0])
    .to_dict()
)

known_names = list(known_map.keys())


def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()


def resolve_from_data(name):
    if name in known_map:
        return known_map[name]

    best_score = 0
    best_dist = None

    for k in known_names:
        score = similarity(name, k)
        if score > best_score:
            best_score = score
            best_dist = known_map[k]

    if best_score >= 0.82:
        return best_dist
    return "Unknown"

mask = df["district"] == "Unknown"
df.loc[mask, "district"] = df.loc[mask, "ds_clean"].apply(resolve_from_data)

unknown = (df["district"] == "Unknown").sum()

# Remove helper column
df.drop(columns=["ds_clean"], inplace=True)

# Save
df.to_csv(OUTPUT_FILE, index=False)

print("Done ✔")
print(f"Unknown DS divisions count: {unknown}")

# Print unique unknown DS divisions for manual fixing
unknown_ds = df[df["district"] == "Unknown"]["ds_division"].drop_duplicates().sort_values()

print("\nUnique UNKNOWN DS divisions (fix manually):")
for name in unknown_ds:
    print(name)

print(f"\nSaved as: {OUTPUT_FILE}")