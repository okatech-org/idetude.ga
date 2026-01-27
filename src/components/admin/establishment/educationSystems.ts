// Systèmes éducatifs mondiaux complets

export interface EducationSystem {
  value: string;
  label: string;
  icon: string;
  description: string;
  mainLanguage: string;
}

export interface EducationSystemCategory {
  id: string;
  label: string;
  icon: string;
  systems: EducationSystem[];
}

export const GLOBAL_EDUCATION_SYSTEM_CATEGORIES: EducationSystemCategory[] = [
  {
    id: "afrique_francophone",
    label: "Afrique Francophone",
    icon: "🌍",
    systems: [
      { value: "gabonais", label: "Gabonais", icon: "🇬🇦", description: "Système national du Gabon (CEP, BEPC, BAC)", mainLanguage: "fr" },
      { value: "congolais_rdc", label: "Congolais (RDC)", icon: "🇨🇩", description: "République Démocratique du Congo", mainLanguage: "fr" },
      { value: "congolais_brazza", label: "Congolais (Congo-Brazzaville)", icon: "🇨🇬", description: "République du Congo", mainLanguage: "fr" },
      { value: "camerounais_fr", label: "Camerounais Francophone", icon: "🇨🇲", description: "Système francophone du Cameroun", mainLanguage: "fr" },
      { value: "ivoirien", label: "Ivoirien", icon: "🇨🇮", description: "Côte d'Ivoire (CEPE, BEPC, BAC)", mainLanguage: "fr" },
      { value: "senegalais", label: "Sénégalais", icon: "🇸🇳", description: "Sénégal (CFEE, BFEM, BAC)", mainLanguage: "fr" },
      { value: "malien", label: "Malien", icon: "🇲🇱", description: "Mali (DEF, BAC)", mainLanguage: "fr" },
      { value: "burkinabe", label: "Burkinabè", icon: "🇧🇫", description: "Burkina Faso (CEP, BEPC, BAC)", mainLanguage: "fr" },
      { value: "nigerien", label: "Nigérien", icon: "🇳🇪", description: "Niger", mainLanguage: "fr" },
      { value: "beninois", label: "Béninois", icon: "🇧🇯", description: "Bénin (CEP, BEPC, BAC)", mainLanguage: "fr" },
      { value: "togolais", label: "Togolais", icon: "🇹🇬", description: "Togo (CEPD, BEPC, BAC)", mainLanguage: "fr" },
      { value: "guineen", label: "Guinéen", icon: "🇬🇳", description: "Guinée Conakry", mainLanguage: "fr" },
      { value: "tchadien", label: "Tchadien", icon: "🇹🇩", description: "Tchad", mainLanguage: "fr" },
      { value: "centrafricain", label: "Centrafricain", icon: "🇨🇫", description: "République Centrafricaine", mainLanguage: "fr" },
      { value: "mauritanien", label: "Mauritanien", icon: "🇲🇷", description: "Mauritanie (bilingue arabe-français)", mainLanguage: "fr" },
      { value: "djiboutien", label: "Djiboutien", icon: "🇩🇯", description: "Djibouti", mainLanguage: "fr" },
      { value: "comorien", label: "Comorien", icon: "🇰🇲", description: "Comores", mainLanguage: "fr" },
      { value: "malgache", label: "Malgache", icon: "🇲🇬", description: "Madagascar", mainLanguage: "fr" },
      { value: "burundais", label: "Burundais", icon: "🇧🇮", description: "Burundi", mainLanguage: "fr" },
      { value: "rwandais", label: "Rwandais", icon: "🇷🇼", description: "Rwanda (trilingue)", mainLanguage: "fr" },
      { value: "guinee_equatoriale", label: "Équato-Guinéen", icon: "🇬🇶", description: "Guinée Équatoriale", mainLanguage: "fr" },
    ]
  },
  {
    id: "afrique_anglophone",
    label: "Afrique Anglophone",
    icon: "🌍",
    systems: [
      { value: "nigerien_en", label: "Nigérian", icon: "🇳🇬", description: "Nigeria (WAEC, NECO)", mainLanguage: "en" },
      { value: "ghaneen", label: "Ghanéen", icon: "🇬🇭", description: "Ghana (BECE, WASSCE)", mainLanguage: "en" },
      { value: "kenyan", label: "Kenyan", icon: "🇰🇪", description: "Kenya (KCPE, KCSE)", mainLanguage: "en" },
      { value: "tanzanien", label: "Tanzanien", icon: "🇹🇿", description: "Tanzanie", mainLanguage: "en" },
      { value: "ougandais", label: "Ougandais", icon: "🇺🇬", description: "Ouganda (UCE, UACE)", mainLanguage: "en" },
      { value: "sud_africain", label: "Sud-Africain", icon: "🇿🇦", description: "Afrique du Sud (NSC, Matric)", mainLanguage: "en" },
      { value: "zimbabween", label: "Zimbabwéen", icon: "🇿🇼", description: "Zimbabwe (O-Level, A-Level)", mainLanguage: "en" },
      { value: "zambien", label: "Zambien", icon: "🇿🇲", description: "Zambie", mainLanguage: "en" },
      { value: "botswanais", label: "Botswanais", icon: "🇧🇼", description: "Botswana (JCE, BGCSE)", mainLanguage: "en" },
      { value: "namibien", label: "Namibien", icon: "🇳🇦", description: "Namibie (NSSCO, NSSCAS)", mainLanguage: "en" },
      { value: "malawien", label: "Malawien", icon: "🇲🇼", description: "Malawi (JCE, MSCE)", mainLanguage: "en" },
      { value: "liberien", label: "Libérien", icon: "🇱🇷", description: "Liberia", mainLanguage: "en" },
      { value: "sierra_leonais", label: "Sierra-Léonais", icon: "🇸🇱", description: "Sierra Leone (BECE, WASSCE)", mainLanguage: "en" },
      { value: "gambien", label: "Gambien", icon: "🇬🇲", description: "Gambie", mainLanguage: "en" },
      { value: "camerounais_en", label: "Camerounais Anglophone", icon: "🇨🇲", description: "Système anglophone du Cameroun (GCE)", mainLanguage: "en" },
      { value: "ethiopien", label: "Éthiopien", icon: "🇪🇹", description: "Éthiopie", mainLanguage: "en" },
      { value: "erythreen", label: "Érythréen", icon: "🇪🇷", description: "Érythrée", mainLanguage: "en" },
      { value: "mauricien", label: "Mauricien", icon: "🇲🇺", description: "Maurice (CPE, SC, HSC)", mainLanguage: "en" },
      { value: "seychellois", label: "Seychellois", icon: "🇸🇨", description: "Seychelles", mainLanguage: "en" },
      { value: "swazi", label: "Eswatini", icon: "🇸🇿", description: "Eswatini (ex-Swaziland)", mainLanguage: "en" },
      { value: "lesothien", label: "Lesothien", icon: "🇱🇸", description: "Lesotho", mainLanguage: "en" },
    ]
  },
  {
    id: "afrique_lusophone",
    label: "Afrique Lusophone",
    icon: "🌍",
    systems: [
      { value: "angolais", label: "Angolais", icon: "🇦🇴", description: "Angola", mainLanguage: "pt" },
      { value: "mozambicain", label: "Mozambicain", icon: "🇲🇿", description: "Mozambique", mainLanguage: "pt" },
      { value: "cap_verdien", label: "Cap-Verdien", icon: "🇨🇻", description: "Cap-Vert", mainLanguage: "pt" },
      { value: "guinee_bissau", label: "Bissau-Guinéen", icon: "🇬🇼", description: "Guinée-Bissau", mainLanguage: "pt" },
      { value: "sao_tomeen", label: "São-Toméen", icon: "🇸🇹", description: "São Tomé-et-Príncipe", mainLanguage: "pt" },
    ]
  },
  {
    id: "afrique_arabe",
    label: "Afrique Arabe / Maghreb",
    icon: "🌍",
    systems: [
      { value: "marocain", label: "Marocain", icon: "🇲🇦", description: "Maroc (bilingue arabe-français)", mainLanguage: "ar" },
      { value: "algerien", label: "Algérien", icon: "🇩🇿", description: "Algérie", mainLanguage: "ar" },
      { value: "tunisien", label: "Tunisien", icon: "🇹🇳", description: "Tunisie", mainLanguage: "ar" },
      { value: "libyen", label: "Libyen", icon: "🇱🇾", description: "Libye", mainLanguage: "ar" },
      { value: "egyptien", label: "Égyptien", icon: "🇪🇬", description: "Égypte (Thanaweya Amma)", mainLanguage: "ar" },
      { value: "soudanais", label: "Soudanais", icon: "🇸🇩", description: "Soudan", mainLanguage: "ar" },
      { value: "sud_soudanais", label: "Sud-Soudanais", icon: "🇸🇸", description: "Soudan du Sud", mainLanguage: "en" },
      { value: "somalien", label: "Somalien", icon: "🇸🇴", description: "Somalie", mainLanguage: "ar" },
    ]
  },
  {
    id: "europe_occidentale",
    label: "Europe Occidentale",
    icon: "🇪🇺",
    systems: [
      { value: "francais", label: "Français", icon: "🇫🇷", description: "France (Brevet, BAC)", mainLanguage: "fr" },
      { value: "belge_fr", label: "Belge Francophone", icon: "🇧🇪", description: "Belgique francophone (CESS)", mainLanguage: "fr" },
      { value: "belge_nl", label: "Belge Néerlandophone", icon: "🇧🇪", description: "Flandre (ASO, TSO, BSO)", mainLanguage: "nl" },
      { value: "suisse_fr", label: "Suisse Francophone", icon: "🇨🇭", description: "Maturité suisse romande", mainLanguage: "fr" },
      { value: "suisse_de", label: "Suisse Germanophone", icon: "🇨🇭", description: "Matura suisse alémanique", mainLanguage: "de" },
      { value: "suisse_it", label: "Suisse Italophone", icon: "🇨🇭", description: "Maturità Tessin", mainLanguage: "it" },
      { value: "luxembourgeois", label: "Luxembourgeois", icon: "🇱🇺", description: "Luxembourg (trilingue)", mainLanguage: "fr" },
      { value: "monegasque", label: "Monégasque", icon: "🇲🇨", description: "Monaco", mainLanguage: "fr" },
      { value: "andorran", label: "Andorran", icon: "🇦🇩", description: "Andorre (trilingue)", mainLanguage: "ca" },
      { value: "britannique", label: "Britannique", icon: "🇬🇧", description: "GCSE, A-Levels", mainLanguage: "en" },
      { value: "ecossais", label: "Écossais", icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", description: "Highers, Advanced Highers", mainLanguage: "en" },
      { value: "irlandais", label: "Irlandais", icon: "🇮🇪", description: "Leaving Certificate", mainLanguage: "en" },
      { value: "allemand", label: "Allemand", icon: "🇩🇪", description: "Abitur", mainLanguage: "de" },
      { value: "autrichien", label: "Autrichien", icon: "🇦🇹", description: "Matura", mainLanguage: "de" },
      { value: "neerlandais", label: "Néerlandais", icon: "🇳🇱", description: "VWO, HAVO, VMBO", mainLanguage: "nl" },
      { value: "italien", label: "Italien", icon: "🇮🇹", description: "Esame di Stato", mainLanguage: "it" },
      { value: "espagnol", label: "Espagnol", icon: "🇪🇸", description: "Selectividad / EBAU", mainLanguage: "es" },
      { value: "portugais", label: "Portugais", icon: "🇵🇹", description: "Exames Nacionais", mainLanguage: "pt" },
    ]
  },
  {
    id: "europe_nordique",
    label: "Europe Nordique",
    icon: "❄️",
    systems: [
      { value: "suedois", label: "Suédois", icon: "🇸🇪", description: "Gymnasieexamen", mainLanguage: "sv" },
      { value: "norvegien", label: "Norvégien", icon: "🇳🇴", description: "Vitnemål", mainLanguage: "no" },
      { value: "danois", label: "Danois", icon: "🇩🇰", description: "Studentereksamen", mainLanguage: "da" },
      { value: "finlandais", label: "Finlandais", icon: "🇫🇮", description: "Ylioppilastutkinto", mainLanguage: "fi" },
      { value: "islandais", label: "Islandais", icon: "🇮🇸", description: "Stúdentspróf", mainLanguage: "is" },
    ]
  },
  {
    id: "europe_orientale",
    label: "Europe Centrale & Orientale",
    icon: "🇪🇺",
    systems: [
      { value: "polonais", label: "Polonais", icon: "🇵🇱", description: "Matura", mainLanguage: "pl" },
      { value: "tcheque", label: "Tchèque", icon: "🇨🇿", description: "Maturita", mainLanguage: "cs" },
      { value: "slovaque", label: "Slovaque", icon: "🇸🇰", description: "Maturita", mainLanguage: "sk" },
      { value: "hongrois", label: "Hongrois", icon: "🇭🇺", description: "Érettségi", mainLanguage: "hu" },
      { value: "roumain", label: "Roumain", icon: "🇷🇴", description: "Bacalaureat", mainLanguage: "ro" },
      { value: "bulgare", label: "Bulgare", icon: "🇧🇬", description: "Matura", mainLanguage: "bg" },
      { value: "croate", label: "Croate", icon: "🇭🇷", description: "Državna Matura", mainLanguage: "hr" },
      { value: "serbe", label: "Serbe", icon: "🇷🇸", description: "Matura", mainLanguage: "sr" },
      { value: "slovene", label: "Slovène", icon: "🇸🇮", description: "Matura", mainLanguage: "sl" },
      { value: "bosniaque", label: "Bosnien", icon: "🇧🇦", description: "Matura", mainLanguage: "bs" },
      { value: "macedonien", label: "Macédonien", icon: "🇲🇰", description: "Matura", mainLanguage: "mk" },
      { value: "montenegrin", label: "Monténégrin", icon: "🇲🇪", description: "Matura", mainLanguage: "sr" },
      { value: "kosovar", label: "Kosovar", icon: "🇽🇰", description: "Matura", mainLanguage: "sq" },
      { value: "albanais", label: "Albanais", icon: "🇦🇱", description: "Matura Shtetërore", mainLanguage: "sq" },
      { value: "grec", label: "Grec", icon: "🇬🇷", description: "Panelladikes", mainLanguage: "el" },
      { value: "chypriote", label: "Chypriote", icon: "🇨🇾", description: "Apolytirio", mainLanguage: "el" },
      { value: "turc", label: "Turc", icon: "🇹🇷", description: "YKS (Yükseköğretim)", mainLanguage: "tr" },
    ]
  },
  {
    id: "europe_est",
    label: "Europe de l'Est / CEI",
    icon: "🇪🇺",
    systems: [
      { value: "russe", label: "Russe", icon: "🇷🇺", description: "EGE (Единый гос. экзамен)", mainLanguage: "ru" },
      { value: "ukrainien", label: "Ukrainien", icon: "🇺🇦", description: "ZNO (ЗНО)", mainLanguage: "uk" },
      { value: "belarusse", label: "Biélorusse", icon: "🇧🇾", description: "CT (Централизованное тестирование)", mainLanguage: "ru" },
      { value: "moldave", label: "Moldave", icon: "🇲🇩", description: "BAC Moldave", mainLanguage: "ro" },
      { value: "estonien", label: "Estonien", icon: "🇪🇪", description: "Riigieksamid", mainLanguage: "et" },
      { value: "letton", label: "Letton", icon: "🇱🇻", description: "Centralizētie eksāmeni", mainLanguage: "lv" },
      { value: "lituanien", label: "Lituanien", icon: "🇱🇹", description: "Brandos egzaminai", mainLanguage: "lt" },
      { value: "georgien", label: "Géorgien", icon: "🇬🇪", description: "Ertiani Erovnuli", mainLanguage: "ka" },
      { value: "armenien", label: "Arménien", icon: "🇦🇲", description: "Petakan Avartakan", mainLanguage: "hy" },
      { value: "azerbaidjanais", label: "Azerbaïdjanais", icon: "🇦🇿", description: "Buraxılış imtahanları", mainLanguage: "az" },
      { value: "kazakh", label: "Kazakh", icon: "🇰🇿", description: "ЕНТ", mainLanguage: "kk" },
      { value: "ouzbek", label: "Ouzbek", icon: "🇺🇿", description: "DTM", mainLanguage: "uz" },
      { value: "kirghize", label: "Kirghize", icon: "🇰🇬", description: "ОРТ", mainLanguage: "ky" },
      { value: "tadjik", label: "Tadjik", icon: "🇹🇯", description: "Imtihonhoi millī", mainLanguage: "tg" },
      { value: "turkmene", label: "Turkmène", icon: "🇹🇲", description: "Milli synag", mainLanguage: "tk" },
    ]
  },
  {
    id: "amerique_nord",
    label: "Amérique du Nord",
    icon: "🌎",
    systems: [
      { value: "americain", label: "Américain", icon: "🇺🇸", description: "High School Diploma, AP, SAT/ACT", mainLanguage: "en" },
      { value: "canadien_en", label: "Canadien Anglophone", icon: "🇨🇦", description: "OSSD (Ontario), autres provinces", mainLanguage: "en" },
      { value: "canadien_fr", label: "Canadien Francophone (Québec)", icon: "🇨🇦", description: "DES, DEC, Cégep", mainLanguage: "fr" },
      { value: "mexicain", label: "Mexicain", icon: "🇲🇽", description: "Bachillerato, CENEVAL", mainLanguage: "es" },
    ]
  },
  {
    id: "amerique_centrale_caraibes",
    label: "Amérique Centrale & Caraïbes",
    icon: "🌎",
    systems: [
      { value: "guatemalteque", label: "Guatémaltèque", icon: "🇬🇹", description: "Guatemala", mainLanguage: "es" },
      { value: "hondurien", label: "Hondurien", icon: "🇭🇳", description: "Honduras", mainLanguage: "es" },
      { value: "salvadorien", label: "Salvadorien", icon: "🇸🇻", description: "El Salvador (PAES)", mainLanguage: "es" },
      { value: "nicaraguayen", label: "Nicaraguayen", icon: "🇳🇮", description: "Nicaragua", mainLanguage: "es" },
      { value: "costaricain", label: "Costaricien", icon: "🇨🇷", description: "Costa Rica (Bachillerato)", mainLanguage: "es" },
      { value: "panameenpanameen", label: "Panaméen", icon: "🇵🇦", description: "Panama", mainLanguage: "es" },
      { value: "belizien", label: "Bélizien", icon: "🇧🇿", description: "Belize (CXC)", mainLanguage: "en" },
      { value: "cubain", label: "Cubain", icon: "🇨🇺", description: "Cuba", mainLanguage: "es" },
      { value: "dominicain", label: "Dominicain", icon: "🇩🇴", description: "République Dominicaine", mainLanguage: "es" },
      { value: "haitien", label: "Haïtien", icon: "🇭🇹", description: "Haïti (Bac Haïtien)", mainLanguage: "fr" },
      { value: "jamaicain", label: "Jamaïcain", icon: "🇯🇲", description: "Jamaïque (CXC, CAPE)", mainLanguage: "en" },
      { value: "trinidadien", label: "Trinidadien", icon: "🇹🇹", description: "Trinité-et-Tobago (CXC)", mainLanguage: "en" },
      { value: "barbadien", label: "Barbadien", icon: "🇧🇧", description: "Barbade (CXC)", mainLanguage: "en" },
      { value: "portoricain", label: "Portoricain", icon: "🇵🇷", description: "Porto Rico (système US)", mainLanguage: "es" },
      { value: "antillais_fr", label: "Antilles Françaises", icon: "🇲🇶", description: "Martinique, Guadeloupe (BAC français)", mainLanguage: "fr" },
    ]
  },
  {
    id: "amerique_sud",
    label: "Amérique du Sud",
    icon: "🌎",
    systems: [
      { value: "bresilien", label: "Brésilien", icon: "🇧🇷", description: "ENEM, Vestibular", mainLanguage: "pt" },
      { value: "argentin", label: "Argentin", icon: "🇦🇷", description: "Bachillerato", mainLanguage: "es" },
      { value: "chilien", label: "Chilien", icon: "🇨🇱", description: "PSU / PAES", mainLanguage: "es" },
      { value: "colombien", label: "Colombien", icon: "🇨🇴", description: "ICFES Saber 11", mainLanguage: "es" },
      { value: "peruvien", label: "Péruvien", icon: "🇵🇪", description: "Educación Secundaria", mainLanguage: "es" },
      { value: "venezuelien", label: "Vénézuélien", icon: "🇻🇪", description: "Bachillerato", mainLanguage: "es" },
      { value: "equatorien", label: "Équatorien", icon: "🇪🇨", description: "Bachillerato", mainLanguage: "es" },
      { value: "bolivien", label: "Bolivien", icon: "🇧🇴", description: "Bachillerato", mainLanguage: "es" },
      { value: "paraguayen", label: "Paraguayen", icon: "🇵🇾", description: "Bachillerato", mainLanguage: "es" },
      { value: "uruguayen", label: "Uruguayen", icon: "🇺🇾", description: "Bachillerato", mainLanguage: "es" },
      { value: "guyanais", label: "Guyanien", icon: "🇬🇾", description: "Guyana (CXC)", mainLanguage: "en" },
      { value: "surinamais", label: "Surinamais", icon: "🇸🇷", description: "Suriname", mainLanguage: "nl" },
      { value: "guyane_fr", label: "Guyane Française", icon: "🇬🇫", description: "Système français", mainLanguage: "fr" },
    ]
  },
  {
    id: "asie_est",
    label: "Asie de l'Est",
    icon: "🌏",
    systems: [
      { value: "chinois", label: "Chinois", icon: "🇨🇳", description: "Gaokao (高考)", mainLanguage: "zh" },
      { value: "japonais", label: "Japonais", icon: "🇯🇵", description: "Centre Test, Université", mainLanguage: "ja" },
      { value: "coreen_sud", label: "Sud-Coréen", icon: "🇰🇷", description: "Suneung (수능)", mainLanguage: "ko" },
      { value: "coreen_nord", label: "Nord-Coréen", icon: "🇰🇵", description: "Corée du Nord", mainLanguage: "ko" },
      { value: "taiwanais", label: "Taïwanais", icon: "🇹🇼", description: "GSAT, AST", mainLanguage: "zh" },
      { value: "hongkongais", label: "Hongkongais", icon: "🇭🇰", description: "HKDSE", mainLanguage: "zh" },
      { value: "macaois", label: "Macanais", icon: "🇲🇴", description: "Macao", mainLanguage: "zh" },
      { value: "mongol", label: "Mongol", icon: "🇲🇳", description: "Mongolie", mainLanguage: "mn" },
    ]
  },
  {
    id: "asie_sud_est",
    label: "Asie du Sud-Est",
    icon: "🌏",
    systems: [
      { value: "singapourien", label: "Singapourien", icon: "🇸🇬", description: "PSLE, O-Level, A-Level", mainLanguage: "en" },
      { value: "malaisien", label: "Malaisien", icon: "🇲🇾", description: "SPM, STPM", mainLanguage: "ms" },
      { value: "indonesien", label: "Indonésien", icon: "🇮🇩", description: "Ujian Nasional", mainLanguage: "id" },
      { value: "philippin", label: "Philippin", icon: "🇵🇭", description: "K-12 (Senior High)", mainLanguage: "en" },
      { value: "thailandais", label: "Thaïlandais", icon: "🇹🇭", description: "O-NET, A-NET", mainLanguage: "th" },
      { value: "vietnamien", label: "Vietnamien", icon: "🇻🇳", description: "Kỳ thi THPT Quốc gia", mainLanguage: "vi" },
      { value: "cambodgien", label: "Cambodgien", icon: "🇰🇭", description: "Bac Khmer", mainLanguage: "km" },
      { value: "laotien", label: "Laotien", icon: "🇱🇦", description: "Laos", mainLanguage: "lo" },
      { value: "birman", label: "Birman", icon: "🇲🇲", description: "Myanmar", mainLanguage: "my" },
      { value: "bruneien", label: "Brunéien", icon: "🇧🇳", description: "Brunei (GCE)", mainLanguage: "ms" },
      { value: "timorais", label: "Timorais", icon: "🇹🇱", description: "Timor Oriental", mainLanguage: "pt" },
    ]
  },
  {
    id: "asie_sud",
    label: "Asie du Sud",
    icon: "🌏",
    systems: [
      { value: "indien", label: "Indien", icon: "🇮🇳", description: "CBSE, ICSE, State Boards", mainLanguage: "en" },
      { value: "pakistanais", label: "Pakistanais", icon: "🇵🇰", description: "Matric, Intermediate, CIE", mainLanguage: "en" },
      { value: "bangladais", label: "Bangladais", icon: "🇧🇩", description: "SSC, HSC", mainLanguage: "bn" },
      { value: "sri_lankais", label: "Sri-Lankais", icon: "🇱🇰", description: "O-Level, A-Level (local)", mainLanguage: "en" },
      { value: "nepalais", label: "Népalais", icon: "🇳🇵", description: "SEE (ex-SLC)", mainLanguage: "ne" },
      { value: "bhoutanais", label: "Bhoutanais", icon: "🇧🇹", description: "Bhoutan (BCSE, BHSEC)", mainLanguage: "dz" },
      { value: "maldivien", label: "Maldivien", icon: "🇲🇻", description: "Maldives (O-Level, A-Level)", mainLanguage: "dv" },
      { value: "afghan", label: "Afghan", icon: "🇦🇫", description: "Kankor", mainLanguage: "ps" },
    ]
  },
  {
    id: "moyen_orient",
    label: "Moyen-Orient",
    icon: "🌍",
    systems: [
      { value: "saoudien", label: "Saoudien", icon: "🇸🇦", description: "Thanawiyya / Qudrat", mainLanguage: "ar" },
      { value: "emirien", label: "Émirien (EAU)", icon: "🇦🇪", description: "Émirats Arabes Unis", mainLanguage: "ar" },
      { value: "qatari", label: "Qatari", icon: "🇶🇦", description: "Qatar", mainLanguage: "ar" },
      { value: "koweitien", label: "Koweïtien", icon: "🇰🇼", description: "Koweït", mainLanguage: "ar" },
      { value: "bahreini", label: "Bahreïni", icon: "🇧🇭", description: "Bahreïn", mainLanguage: "ar" },
      { value: "omanais", label: "Omanais", icon: "🇴🇲", description: "Oman", mainLanguage: "ar" },
      { value: "yemenite", label: "Yéménite", icon: "🇾🇪", description: "Yémen", mainLanguage: "ar" },
      { value: "irakien", label: "Irakien", icon: "🇮🇶", description: "Irak (Baccalauréat)", mainLanguage: "ar" },
      { value: "syrien", label: "Syrien", icon: "🇸🇾", description: "Syrie", mainLanguage: "ar" },
      { value: "jordanien", label: "Jordanien", icon: "🇯🇴", description: "Tawjihi", mainLanguage: "ar" },
      { value: "libanais", label: "Libanais", icon: "🇱🇧", description: "BAC Libanais (trilingue)", mainLanguage: "ar" },
      { value: "palestinien", label: "Palestinien", icon: "🇵🇸", description: "Tawjihi", mainLanguage: "ar" },
      { value: "israelien", label: "Israélien", icon: "🇮🇱", description: "Bagrut", mainLanguage: "he" },
      { value: "iranien", label: "Iranien", icon: "🇮🇷", description: "Konkur (کنکور)", mainLanguage: "fa" },
    ]
  },
  {
    id: "oceanie",
    label: "Océanie",
    icon: "🌏",
    systems: [
      { value: "australien", label: "Australien", icon: "🇦🇺", description: "HSC, VCE, QCE, ATAR", mainLanguage: "en" },
      { value: "neo_zelandais", label: "Néo-Zélandais", icon: "🇳🇿", description: "NCEA", mainLanguage: "en" },
      { value: "fidjien", label: "Fidjien", icon: "🇫🇯", description: "Fidji (FSLCE)", mainLanguage: "en" },
      { value: "papouasien", label: "Papouasien", icon: "🇵🇬", description: "Papouasie-Nouvelle-Guinée", mainLanguage: "en" },
      { value: "salomonais", label: "Salomonais", icon: "🇸🇧", description: "Îles Salomon", mainLanguage: "en" },
      { value: "vanuatuan", label: "Vanuatuan", icon: "🇻🇺", description: "Vanuatu (bilingue)", mainLanguage: "en" },
      { value: "samoan", label: "Samoan", icon: "🇼🇸", description: "Samoa", mainLanguage: "en" },
      { value: "tongien", label: "Tongien", icon: "🇹🇴", description: "Tonga", mainLanguage: "en" },
      { value: "polynesie_fr", label: "Polynésie Française", icon: "🇵🇫", description: "Système français", mainLanguage: "fr" },
      { value: "nouvelle_caledonie", label: "Néo-Calédonien", icon: "🇳🇨", description: "Nouvelle-Calédonie (français)", mainLanguage: "fr" },
    ]
  },
  {
    id: "international",
    label: "Programmes Internationaux",
    icon: "🌐",
    systems: [
      { value: "ib_pyp", label: "IB - PYP", icon: "🌐", description: "Primary Years Programme (3-12 ans)", mainLanguage: "multi" },
      { value: "ib_myp", label: "IB - MYP", icon: "🌐", description: "Middle Years Programme (11-16 ans)", mainLanguage: "multi" },
      { value: "ib_dp", label: "IB - Diploma Programme", icon: "🌐", description: "Baccalauréat International (16-19 ans)", mainLanguage: "multi" },
      { value: "ib_cp", label: "IB - Career Programme", icon: "🌐", description: "Programme à orientation professionnelle", mainLanguage: "multi" },
      { value: "cambridge_primary", label: "Cambridge Primary", icon: "📚", description: "Cambridge (5-11 ans)", mainLanguage: "en" },
      { value: "cambridge_lower", label: "Cambridge Lower Secondary", icon: "📚", description: "Cambridge (11-14 ans)", mainLanguage: "en" },
      { value: "cambridge_igcse", label: "Cambridge IGCSE", icon: "📚", description: "International GCSE (14-16 ans)", mainLanguage: "en" },
      { value: "cambridge_as_a", label: "Cambridge AS & A Level", icon: "📚", description: "Advanced Level (16-19 ans)", mainLanguage: "en" },
      { value: "edexcel_igcse", label: "Edexcel International GCSE", icon: "📖", description: "Pearson Edexcel IGCSE", mainLanguage: "en" },
      { value: "edexcel_ial", label: "Edexcel IAL", icon: "📖", description: "International A Levels", mainLanguage: "en" },
      { value: "aefe", label: "AEFE / Homologué France", icon: "🇫🇷", description: "Lycées français à l'étranger", mainLanguage: "fr" },
      { value: "mission_laique", label: "Mission Laïque", icon: "🇫🇷", description: "Réseau MLF/OSUI", mainLanguage: "fr" },
      { value: "abibac", label: "AbiBac", icon: "🇫🇷🇩🇪", description: "Double diplôme franco-allemand", mainLanguage: "multi" },
      { value: "bachibac", label: "BachiBac", icon: "🇫🇷🇪🇸", description: "Double diplôme franco-espagnol", mainLanguage: "multi" },
      { value: "esabac", label: "EsaBac", icon: "🇫🇷🇮🇹", description: "Double diplôme franco-italien", mainLanguage: "multi" },
      { value: "oib", label: "OIB / BFI", icon: "🇫🇷🌐", description: "Option/Bac Français International", mainLanguage: "multi" },
      { value: "american_intl", label: "American International", icon: "🇺🇸", description: "Curriculum américain international", mainLanguage: "en" },
      { value: "sat_ap", label: "SAT / Advanced Placement", icon: "🇺🇸", description: "Tests standardisés américains", mainLanguage: "en" },
    ]
  },
  {
    id: "specialise",
    label: "Pédagogies Alternatives",
    icon: "🎓",
    systems: [
      { value: "montessori", label: "Montessori", icon: "🌱", description: "Pédagogie Maria Montessori", mainLanguage: "multi" },
      { value: "waldorf_steiner", label: "Waldorf-Steiner", icon: "🌈", description: "Pédagogie Rudolf Steiner", mainLanguage: "multi" },
      { value: "freinet", label: "Freinet", icon: "✏️", description: "Pédagogie Célestin Freinet", mainLanguage: "fr" },
      { value: "reggio_emilia", label: "Reggio Emilia", icon: "🎨", description: "Approche Reggio Emilia", mainLanguage: "multi" },
      { value: "finlandais_alt", label: "Modèle Finlandais", icon: "🇫🇮", description: "Approche finlandaise adaptée", mainLanguage: "multi" },
      { value: "homeschool", label: "Instruction à domicile", icon: "🏠", description: "Homeschooling / IEF", mainLanguage: "multi" },
    ]
  },
  {
    id: "religieux",
    label: "Enseignement Confessionnel",
    icon: "⛪",
    systems: [
      { value: "catholique", label: "Catholique", icon: "✝️", description: "Enseignement catholique", mainLanguage: "multi" },
      { value: "protestant", label: "Protestant", icon: "✝️", description: "Enseignement protestant", mainLanguage: "multi" },
      { value: "islamique", label: "Islamique", icon: "☪️", description: "Enseignement islamique", mainLanguage: "multi" },
      { value: "juif", label: "Juif", icon: "✡️", description: "Enseignement juif", mainLanguage: "multi" },
      { value: "bouddhiste", label: "Bouddhiste", icon: "☸️", description: "Enseignement bouddhiste", mainLanguage: "multi" },
      { value: "hindou", label: "Hindou", icon: "🕉️", description: "Enseignement hindou", mainLanguage: "multi" },
    ]
  },
];

// Flatten all systems for easy access
export const ALL_EDUCATION_SYSTEMS: EducationSystem[] = GLOBAL_EDUCATION_SYSTEM_CATEGORIES.flatMap(cat => cat.systems);

// Helper function to get teaching languages from selected systems
export const getTeachingLanguagesFromSystems = (educationSystems: string[]): string[] => {
  const languages = new Set<string>();
  educationSystems.forEach(sysValue => {
    const system = ALL_EDUCATION_SYSTEMS.find(s => s.value === sysValue);
    if (system?.mainLanguage && system.mainLanguage !== "multi") {
      languages.add(system.mainLanguage);
    }
  });
  return Array.from(languages);
};

// Helper for language designation
export const getLanguageDesignation = (
  educationSystems: string[],
  additionalTeachingLanguages: string[]
): { label: string; icon: string; totalLanguages: number } | null => {
  const systemLanguages = getTeachingLanguagesFromSystems(educationSystems);
  const allTeachingLanguages = new Set([...systemLanguages, ...additionalTeachingLanguages]);
  const totalLanguages = allTeachingLanguages.size;
  const isMixedSystem = educationSystems.length > 1;

  if (totalLanguages === 1) {
    return isMixedSystem ? { label: "Mixte / Hybride", icon: "🔀", totalLanguages } : null;
  }
  if (totalLanguages === 2) {
    return { label: isMixedSystem ? "Mixte Bilingue" : "Bilingue", icon: "🌍", totalLanguages };
  }
  if (totalLanguages === 3) {
    return { label: isMixedSystem ? "Mixte Trilingue" : "Trilingue", icon: "🌐", totalLanguages };
  }
  if (totalLanguages > 3) {
    return { label: isMixedSystem ? "Mixte Multilingue" : "Multilingue", icon: "🌐", totalLanguages };
  }
  return null;
};
