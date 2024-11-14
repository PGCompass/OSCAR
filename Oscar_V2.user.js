// ==UserScript==
// @name         OSCAR ALL
// @version      2.3
// @description  Amélioration Oscar
// @author       Pierre GARDIE - Compass Group France
// @match        https://portail-oscar.compass-group.fr
// @updateURL    https://github.com/PGCompass/OSCAR/raw/refs/heads/main/Oscar_V2.user.js
// @downloadURL  https://github.com/PGCompass/OSCAR/raw/refs/heads/main/Oscar_V2.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

//////////////////////////////////////////////////
//
//          BUGFIX
//
//////////////////////////////////////////////////

// V2.3 - 29/03/2022 :
// Bugfix fonction nom_recette : suppression .split("</span>          ")[2] suite à mise à jour Oscar.

// V2.2b - 13/02/2022 :
//
//     Fusion menu semaine / feuille de prod,
//     Ajout du filtre pour les articles sans prix,
//     Prise en compte des légumes, boissons et laitages pour la vérification à la semaine.

// V2.1 - 10/02/2022 :
//
//     Ajout de catégories dans BD.
//     Ajout de la vérification semaine.

// V2.0 - 09/09/2019 :
//
//     Ajout des fonctions pour une mise à jour plus rapide,
//     Ajout des menus à la semaine,
//     Nouveau codage sur le module feuille de prod,
//     Les sauces ne sont plus comptées dans le total des feuilles de prod,
//     Ajout du taux de prise sur les feuilles de prod.
//     Ajout d'une colonne fait sur les feuilles de prod.
//     Fix du bug des catégories sur les impressions : il n'y a plus le "_blank".


//////////////////////////////////////////////////
//
//          BASE DE DONNEES
//
//////////////////////////////////////////////////

// Tableaux avec les catégories
var categorie_plat = [
    "<--TOUT-->",
    "ENTREES",
    "SALAD'BAR",
    "PLAT",
    "LEGUMES",
    "DESSERTS",
    "FRUIT'BAR",
    "BOISSONS",
    "LAITAGES",
    "DIVERS",
];


// Tableaux des plats ["NOM", "foodXX",categorie_plat,nb_plat,feuil_prod]
var categorie = 'var categorie = [';
  //Entrees
    categorie+= '    ["Entrees","3",2,1,1],';
    categorie+= '    ["Entrees Chaudes","1",2,1,1],';
    categorie+= '    ["Entrees Dressees","93",2,1,1],';
    categorie+= '    ["Entree fixe","8",2,1,1],';
    categorie+= '    ["Grande Salade","4",2,1,1],';
    categorie+= '    ["Fromage","66",2,,1],';
  //Salad'bar
    categorie+= '    ["Salade BAR","33",3,7,1],';
    categorie+= '    ["Topping","90",3,7,1],';
  //Plats
    categorie+= '    ["Bar a Soupe","91",4,,2],';
    categorie+= '    ["Bon par Nature","42",4,2,2],';
    categorie+= '    ["Comptoir du chef","11",4,2,2],';
    categorie+= '    ["Rotisserie","53",4,2,2],';
    categorie+= '    ["Plat du Jour","41",4,2,2],';
    categorie+= '    ["Cuisine du Monde","18",4,2,2],';
    categorie+= '    ["Fléxitarien","187",4,2,2],';
    categorie+= '    ["Burger and Co","78",4,2,2],';
    categorie+= '    ["Grillade","51",4,2,2],';
    categorie+= '    ["Trattoria","82",4,2,2],';
    categorie+= '    ["Cuisson minute","35",4,2,2],';
    categorie+= '    ["Peche du Jour","44",4,2,2],';
    categorie+= '    ["Plat Bistrot","178",4,2,2],';
    categorie+= '    ["Stand Express","29",4,2,2],';
    categorie+= '    ["Globe Cooker","174",4,2,2],';
    categorie+= '    ["Street Good","175",4,2,2],';
    categorie+= '    ["600 max","98",4,2,2],';
    categorie+= '    ["Les cocottes","180",4,2,2],';
    categorie+= '    ["Au naturel","172",4,2,2],';
  //Légumes
    categorie+= '    ["Bar a legumes","64",5,3,2],';
    categorie+= '    ["Legumes","56",5,3,2],';
    categorie+= '    ["Accompagnements","10",5,3,2],';
    categorie+= '    ["Legumes fixe","34",5,3,2],';
  //Desserts
    categorie+= '    ["Desserts","70",6,4,3],';
    categorie+= '    ["Desserts Dresses","28",6,4,3],';
    categorie+= '    ["Patisserie Spectacle","68",6,4,3],';
    categorie+= '    ["Vente Ã  emporter","5",6,,3],';
  //Dessert'bar
    categorie+= '    ["Bar a fruits","61",7,8,3],';
    categorie+= '    ["Dessert bar","27",7,8,3],';
    categorie+= '    ["Topping dessert","214",7,8,3],';
  //Boissons
    categorie+= '    ["Divers","9",8,5,],';
  //Laitages
    categorie+= '    ["Produits laitiers fixes","25",9,6,],';
  //Divers
    categorie+= '    ["Pains","2",10,],';
    categorie+= '    ["Table a condiments","97",10,],';
    categorie+= '    ["Fruits","50",10,],';
    categorie+= '    ["Corbeille de Fruits","77",10,]'; // <<-- toujours le dernier abs "," à la fin
    categorie+= '];';


//////////////////////////////////////////////////
//
//          FONCTIONS
//
//////////////////////////////////////////////////


    // date du jour
var fonctions = 'function date_jour(id_jour) {';
    fonctions+= '   return document.getElementsByClassName("ribmenucol zflol week-5")[id_jour].getElementsByClassName("tinylabel")[0].innerHTML';
    fonctions+= '}';
    // Nom du jour
    fonctions+= 'function nom_jour(id_jour) {';
    fonctions+= '   return document.getElementsByClassName("ribmenucol zflol week-5")[id_jour].getElementsByClassName("ztexb")[0].innerHTML';
    fonctions+= '}';
    // Nombre de couverts
    fonctions+= 'function nb_couverts(id_jour) {';
    fonctions+= '   return document.getElementsByClassName("ribmenucol week-5 zflol zpadt0")[id_jour].getElementsByClassName("zflor")[0].getElementsByClassName("ztexb")[0].innerHTML';
    fonctions+= '}';
    // Nom de la recette
    fonctions += 'function nom_recette(id_food, id_jour, id_ligne) {';
    fonctions += '   var elements = document.querySelectorAll(".food" + id_food + ".dishtype.noguideline")[id_jour].querySelectorAll(".article");';
    fonctions += '   return elements[id_ligne] ? elements[id_ligne].innerText.split("(")[0].trim() : null;';
    fonctions += '}';
    // Prix TTC
    fonctions+= 'function prix_recette(id_food,id_jour,id_ligne) {';
    fonctions+= '   return document.getElementsByClassName("food"+id_food+" dishtype  noguideline ")[id_jour].getElementsByClassName("dishprice menu-calendar-price")[id_ligne].innerHTML.split(":")[1]';
    fonctions+= '}';
    // Quantité
    fonctions+= 'function qte_recette(id_food,id_jour,id_ligne) {';
    fonctions+= '   if (document.getElementsByClassName("food"+id_food+" dishtype  noguideline ")[id_jour].getElementsByClassName("dishprice menu-calendar-qty")[id_ligne] != null) {'
    fonctions+= '     return document.getElementsByClassName("food"+id_food+" dishtype  noguideline ")[id_jour].getElementsByClassName("dishprice menu-calendar-qty")[id_ligne].innerHTML.split(":")[1]';
    fonctions+= '   } else {';
    fonctions+= '     return 0';
    fonctions+= '   }';
    fonctions+= '}';
    // Maximum de recette par catégorie
    fonctions+= 'function max_recette(id_food, id_jour) {';
    fonctions+= '   return document.getElementsByClassName("food"+id_food+" dishtype  noguideline ")[id_jour].getElementsByClassName("normal-icon icon-eye zpabs zr0 zt0 qz_Menus_Recipe_View").length';
    fonctions+= '}';
    // Nombre de plat par catégorie
    fonctions+= 'function max_plat_categorie(id_food, id_jour) {';
    fonctions+= '   return document.getElementsByClassName("food"+id_food+" dishtype  noguideline ")[id_jour].getElementsByClassName("dish-qty zpadr5 ztexr")[0].getElementsByClassName("zflor ")[0].innerHTML';
    fonctions+= '}';


//////////////////////////////////////////////////
//
//          MODULE AFFICHAGE PLAT
//
//////////////////////////////////////////////////

// Code pour insérer le menu déroulant
function liste_menu() {
    var i;
    var liste_menu = '<form name="Choix" id="FORM_AFFICHAGE_PLAT"><select name="Liste" onchange="hide_div(this.value)"><option selected="selected" value="0">CATEGORIE</option>';
    for (i = 1; i < categorie_plat.length+1; i++) {
        liste_menu+= '<option value='+i+'>'+categorie_plat[i-1]+'</option>';
    }
    liste_menu+= '<option value=99>SANS PRIX</option>';
    liste_menu+= '</select></form>';
    return liste_menu;
}

// Code à insérer pour cacher les div
var hide_div = 'function hide_div(id) {';
    hide_div+= '    var numero = "";';
    hide_div+= '    var nb_recette_sans_prix = 0;';
    hide_div+= '    var div_style = "";';
    hide_div+= '    for (i = 0; i < categorie.length; i++) {';
    hide_div+= '        numero = categorie[i][1];';
    hide_div+= '        div_style = "";';
    hide_div+= '        for (j = 0; j < 5; j++) {';
    hide_div+= '            if (document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j] != null) {';
    hide_div+= '                document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j].style.display="";';
    hide_div+= '                for (recette = 0 ; recette < max_recette(numero,j) ; recette++) {';
    hide_div+= '                    document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j].getElementsByClassName("accordion")[recette].style.display="";';
    hide_div+= '                    document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j].getElementsByClassName("bottom")[recette].style.display="";';
    hide_div+= '                };';
    hide_div+= '            }';
    hide_div+= '        }';
    hide_div+= '    }';
    hide_div+= '    if (id != 99) {';
    hide_div+= '        for (i = 0; i < categorie.length; i++) {';
    hide_div+= '            numero = categorie[i][1];';
    hide_div+= '            div_style = "";';
    hide_div+= '            if (id == 1){';
    hide_div+= '                div_style = "";';
    hide_div+= '            } else if (id != categorie[i][2]){';
    hide_div+= '                div_style = "none";';
    hide_div+= '            }';
    hide_div+= '            for (j = 0; j < 5; j++) {';
    hide_div+= '                if (document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j] != null) {';
    hide_div+= '                    document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j].style.display=div_style;';
    hide_div+= '                }';
    hide_div+= '            }';
    hide_div+= '        }';
    hide_div+= '    } else {';
    hide_div+= '        for (i = 0; i < categorie.length; i++) {';
    hide_div+= '            numero = categorie[i][1];';
    hide_div+= '            div_style = "";';
    hide_div+= '            for (j = 0; j < 5; j++) {';
    hide_div+= '                nb_recette_sans_prix = 0;';
    hide_div+= '                if (document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j] != null) {';
    hide_div+= '                    for (recette = 0 ; recette < max_recette(numero,j) ; recette++) {';
    hide_div+= '                        if (prix_recette(numero,j,recette) == "0.00") {';
    hide_div+= '                            nb_recette_sans_prix = nb_recette_sans_prix + 1;';
    hide_div+= '                        } else {';
    hide_div+= '                            document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j].getElementsByClassName("accordion")[recette].style.display="none";';
    hide_div+= '                            document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j].getElementsByClassName("bottom")[recette].style.display="none";';
    hide_div+= '                        };';
    hide_div+= '                    };';
    hide_div+= '                    if (nb_recette_sans_prix == 0) {';
    hide_div+= '                        document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[j].style.display="none";';
    hide_div+= '                    }';
    hide_div+= '                }';
    hide_div+= '            }';
    hide_div+= '        }';
    hide_div+= '    }';
    hide_div+= '    document.Choix.Liste.selectedIndex = 0;';
    hide_div+= '}';


//////////////////////////////////////////////////
//
//          MODULE FEUILLE DE PRODUCTION & MENU
//
//////////////////////////////////////////////////

// Code pour la liste des jours de la semaine
var liste_jour_prod = '<form name="form_prod" id="FORM_FEUIL_PROD">';
	liste_jour_prod+= '	 <select name="Liste" onchange="feuil_prod(this.value)">';
	liste_jour_prod+= '		<option selected="selected" value="0">PRODUCTION</option>';
	liste_jour_prod+= '		<option value="1">SEMAINE</option>';
	liste_jour_prod+= '		<option value="2">LUNDI</option>';
	liste_jour_prod+= '		<option value="3">MARDI</option>';
	liste_jour_prod+= '		<option value="4">MERCREDI</option>';
	liste_jour_prod+= '		<option value="5">JEUDI</option>';
	liste_jour_prod+= '		<option value="6">VENDREDI</option>';
    liste_jour_prod+= '	 </select>';
	liste_jour_prod+= '</form>';

var feuil_prod = 'function feuil_prod(id_jour) {';
    feuil_prod+= '    var id_jour = id_jour - 2;';
    feuil_prod+= '        html_tableau = "<script type=\'text/javascript\'>";';
    feuil_prod+= '        html_tableau+= "function feuil_prod_choix(id){";';
    feuil_prod+= '        html_tableau+= "    tr_entree = document.getElementById(\'entree\');";';
    feuil_prod+= '        html_tableau+= "    tr_plat = document.getElementById(\'plat\');";';
    feuil_prod+= '        html_tableau+= "    tr_dessert = document.getElementById(\'dessert\');";';
    feuil_prod+= '        html_tableau+= "    if (id == 0) {";';
    feuil_prod+= '        html_tableau+= "        tr_entree.style.display = \'\';";';
    feuil_prod+= '        html_tableau+= "        tr_plat.style.display = \'none\';";';
    feuil_prod+= '        html_tableau+= "        tr_dessert.style.display = \'none\';";';
    feuil_prod+= '        html_tableau+= "    } else if ( id == 1) {";';
    feuil_prod+= '        html_tableau+= "        tr_entree.style.display = \'none\';";';
    feuil_prod+= '        html_tableau+= "        tr_plat.style.display = \'\';";';
    feuil_prod+= '        html_tableau+= "        tr_dessert.style.display = \'none\';";';
    feuil_prod+= '        html_tableau+= "    } else if ( id == 2) {";';
    feuil_prod+= '        html_tableau+= "        tr_entree.style.display = \'none\';";';
    feuil_prod+= '        html_tableau+= "        tr_plat.style.display = \'none\';";';
    feuil_prod+= '        html_tableau+= "        tr_dessert.style.display = \'\';";';
    feuil_prod+= '        html_tableau+= "    }";';
    feuil_prod+= '        html_tableau+= "}";';
    feuil_prod+= '        html_tableau+= "</script>";';
    feuil_prod+= '        html_tableau+= "<form name=\'form_feuil_prod\' id=\'FORM4\'>";';
    feuil_prod+= '        html_tableau+= "    <select name=\'Liste_feuil_prod\' onchange=\'feuil_prod_choix(this.value)\'>";';
    feuil_prod+= '        html_tableau+= "        <option selected=\'selected\' value=\'0\'>ENTREES</option>";';
    feuil_prod+= '        html_tableau+= "        <option value=\'1\'>PLATS</option>";';
    feuil_prod+= '        html_tableau+= "        <option value=\'2\'>DESSERTS</option>";';
    feuil_prod+= '        html_tableau+= "   </select>";';
    // BOUTON IMPRESSION
    feuil_prod+= '        html_tableau+= "<input type=\'button\' onClick=\'window.print()\' value=\'IMPRESSION\' />";';
    feuil_prod+= '        html_tableau+= "</form>";';
    feuil_prod+= '    for (type_plat = 1; type_plat < 4; type_plat++) {';
    feuil_prod+= '    var nb_type_plat = 0;';
	feuil_prod+= '        if (type_plat == 1) {';
	feuil_prod+= '            nom_type_plat = "ENTREES";';
    feuil_prod+= '            var nb_ech = 1;';
    feuil_prod+= '            var tab_style = "";';
    feuil_prod+= '            var id_style = "entree";';
	feuil_prod+= '        } else if (type_plat == 2) {';
	feuil_prod+= '            nom_type_plat = "PLATS";';
    feuil_prod+= '            var nb_ech = 100;';
    feuil_prod+= '            var tab_style = "none";';
    feuil_prod+= '            var id_style = "plat";';
	feuil_prod+= '        } else if (type_plat == 3) {';
	feuil_prod+= '            nom_type_plat = "DESSERTS";';
    feuil_prod+= '            var nb_ech = 200;';
    feuil_prod+= '            var tab_style = "none";';
    feuil_prod+= '            var id_style = "dessert";';
	feuil_prod+= '        }';
    // CREATION DES MENUS SEMAINE
    feuil_prod+= '    if (id_jour < 0) {';
    feuil_prod+= '        html_tableau+= "<table width=100% id=\'"+id_style+"\' style=\'border-collapse : collapse; display : "+tab_style+"\'>";';
    feuil_prod+= '        html_tableau+= "    <caption style=\'border : 1px solid black; text-align : center; padding : 10px;font-size : 20px\'>SEMAINE du "+date_jour(0)+" au "+date_jour(4)+"</caption>";';
    feuil_prod+= '        html_tableau+= "    <thead>";';
    feuil_prod+= '        html_tableau+= "        <tr>";';
    feuil_prod+= '        html_tableau+= "            <th width=10% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'></th>";';
    feuil_prod+= '        html_tableau+= "            <th width=18% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>LUNDI - "+nb_couverts(0)+"</th>";';
    feuil_prod+= '        html_tableau+= "            <th width=18% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>MARDI - "+nb_couverts(1)+"</th>";';
    feuil_prod+= '        html_tableau+= "            <th width=18% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>MERCREDI - "+nb_couverts(2)+"</th>";';
    feuil_prod+= '        html_tableau+= "            <th width=18% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>JEUDI - "+nb_couverts(3)+"</th>";';
    feuil_prod+= '        html_tableau+= "            <th width=18% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>VENDREDI - "+nb_couverts(4)+"</th>";';
    feuil_prod+= '        html_tableau+= "        </tr>";';
    feuil_prod+= '        html_tableau+= "    </thead>";';
    feuil_prod+= '    var numero = "";';
    feuil_prod+= '    for (i = 0; i < categorie.length; i++) {';
    feuil_prod+= '        var menu_temp = [[],[],[],[],[]];';
    feuil_prod+= '        numero = categorie[i][1];';
    feuil_prod+= '    if (document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[0] != null) {';
    // IF = 1 ==> ENTREES ; IF = 2 ==> PLATS ; IF = 3 ==> DESSERTS
    feuil_prod+= '      if (categorie[i][4] == type_plat){';
    feuil_prod+= '        var cat_max = 0;';
    feuil_prod+= '        for (id_jour_bis = 0; id_jour_bis < 5; id_jour_bis++) {';
    feuil_prod+= '            if (cat_max < max_recette(numero, id_jour_bis)) {';
    feuil_prod+= '                cat_max = max_recette(numero, id_jour_bis);';
    feuil_prod+= '            }';
    feuil_prod+= '        }';
    feuil_prod+= '            for (j = 0; j < cat_max; j++) {';
    feuil_prod+= '                for (id_jour_bis = 0; id_jour_bis < 5; id_jour_bis++) {';
    feuil_prod+= '                    if (qte_recette(numero, id_jour_bis, j) > 0) {';
    feuil_prod+= '                        menu_temp[id_jour_bis].push(qte_recette(numero, id_jour_bis, j)+" x "+nom_recette(numero, id_jour_bis, j));';
    feuil_prod+= '                    }';
    feuil_prod+= '                }';
    feuil_prod+= '            }';
    feuil_prod+= '            var menu_temp_max = 0;';
    feuil_prod+= '            for (id_jour_bis = 0; id_jour_bis < 5; id_jour_bis++) {';
    feuil_prod+= '                if (menu_temp_max < menu_temp[id_jour_bis].length) {';
    feuil_prod+= '                    menu_temp_max = menu_temp[id_jour_bis].length;';
    feuil_prod+= '                }';
    feuil_prod+= '            }';
    feuil_prod+= '            if (menu_temp_max > 0) {';
    feuil_prod+= '            for (id_menu = 0; id_menu < menu_temp_max; id_menu++) {';
    feuil_prod+= '                html_tableau+= "        <tr style=\'font-size : small;\'>";';
    feuil_prod+= '                html_tableau+= "            <td style=\'border : 1px solid black; padding : 4px; font-size : 10px\'>"+categorie[i][0]+"</td>";';
    feuil_prod+= '                for (id_jour_bis = 0; id_jour_bis < 5; id_jour_bis++) {';
    feuil_prod+= '                    if (menu_temp[id_jour_bis][id_menu] != null) {';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : center; padding : 4px; font-size : 10px;\'>"+menu_temp[id_jour_bis][id_menu]+"</td>";';
    feuil_prod+= '                    } else {';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : center; padding : 4px; font-size : 10px;\'>&nbsp</td>";';
    feuil_prod+= '                    }';
    feuil_prod+= '                }';
    feuil_prod+= '                html_tableau+= "        </tr>";';
    feuil_prod+= '            }';
    feuil_prod+= '                html_tableau+= "<tr><td style=\'padding : 3px; font-size : 5px\'>&nbsp;</td></tr>";';
    feuil_prod+= '            }';
    feuil_prod+= '          }';
    feuil_prod+= '      }';
    feuil_prod+= '    }';
    feuil_prod+= '        html_tableau+= "</table>";';
    feuil_prod+= '    } else {';
    // CREATION DES TABLEAUX FEUILLE DE PROD
    feuil_prod+= '        html_tableau+= "<table width=100% id=\'"+id_style+"\' style=\'border-collapse : collapse; display : "+tab_style+"\'>";';
    feuil_prod+= '        html_tableau+= "    <caption style=\'border : 1px solid black; text-align : center; padding : 15px;\'>"+nom_jour(id_jour)+" "+date_jour(id_jour)+" : "+nb_couverts(id_jour)+" Couverts</caption>";';
    feuil_prod+= '        html_tableau+= "    <thead>";';
    feuil_prod+= '        html_tableau+= "        <tr>";';
    feuil_prod+= '        html_tableau+= "            <th style=\'padding : 5px; padding-top : 30px;\'>TYPE</th>";';
    feuil_prod+= '        html_tableau+= "            <th style=\'padding : 5px; padding-top : 30px;\'>#</th>";';
    feuil_prod+= '        html_tableau+= "            <th style=\'padding : 5px; padding-top : 30px;\'>"+nom_type_plat+"</th>";';
    feuil_prod+= '        html_tableau+= "            <th style=\'padding : 5px; padding-top : 30px;\'>PV</th>";';
    feuil_prod+= '        html_tableau+= "            <th style=\'padding : 5px; padding-top : 30px;\'>QTE</th>";';
    feuil_prod+= '        html_tableau+= "            <th style=\'padding : 5px; padding-top : 30px;\'>FAIT</th>";';
    feuil_prod+= '        html_tableau+= "        </tr>";';
    feuil_prod+= '        html_tableau+= "    </thead>";';
    feuil_prod+= '        var numero = "";';
    feuil_prod+= '		  for (i = 0; i < categorie.length; i++) {';
    feuil_prod+= '            numero = categorie[i][1];';
    // IF = 1 ==> ENTREES ; IF = 2 ==> PLATS ; IF = 3 ==> DESSERTS
    feuil_prod+= '            if (categorie[i][4] == type_plat && document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[id_jour] != null) {';
    feuil_prod+= '                for (j = 0; j < max_recette(numero, id_jour); j++) {';
    feuil_prod+= '                    if (qte_recette(numero,id_jour,j) > 0) {';
    feuil_prod+= '                        html_tableau+= "        <tr style=\'font-size : small;\'>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; padding : 5px;\'>"+categorie[i][0]+"</td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : center; padding : 5px;\'>"+nb_ech+"</td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; padding : 5px;\'>"+nom_recette(numero,id_jour,j)+"</td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : right; padding : 5px;\'>"+prix_recette(numero,id_jour,j)+"</td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : right; padding : 5px;\'>"+qte_recette(numero,id_jour,j)+"</td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : right; padding : 5px;\'></td>";';
    feuil_prod+= '                        html_tableau+= "        </tr>";';
    feuil_prod+= '                        nb_ech = nb_ech + 1;';
    feuil_prod+= '                    }';
    feuil_prod+= '                    if (categorie[i][3] == type_plat && nom_recette(numero,id_jour,j).startsWith("SCE") == 0) {';
    feuil_prod+= '                        nb_type_plat = nb_type_plat + parseInt(qte_recette(numero,id_jour,j));';
    feuil_prod+= '                    }';
    feuil_prod+= '                }';
    feuil_prod+= '                if (max_plat_categorie(numero, id_jour) > 0) {';
    feuil_prod+= '                        html_tableau+= "<tr><td>&nbsp;</td></tr>";';
    feuil_prod+= '                }';
    feuil_prod+= '            }';
    feuil_prod+= '        }';
    feuil_prod+= '                        html_tableau+= "        <tr style=\'font-size : small;\'>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; padding : 5px;\'>TOTAL : </td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; padding : 5px;\'></td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : right; padding : 5px;\'>TAUX DE PRISE</td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : center; padding : 5px;\'>"+ (nb_type_plat / nb_couverts(id_jour) * 100).toFixed(1) +" % </td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; text-align : right; padding : 5px;\'>"+nb_type_plat+"</td>";';
    feuil_prod+= '                        html_tableau+= "            <td style=\'border : 1px solid black; padding : 5px;\'></td>";';
    feuil_prod+= '                        html_tableau+= "        </tr>";';
    feuil_prod+= '                        html_tableau+= "</table>";';
	feuil_prod+= '       }';
    feuil_prod+= '    }';
    // création de la page HTML
    feuil_prod+= '    w = open("","Print_page","width=800,height=1000,toolbar=no,scrollbars=yes,resizable=yes");';
    feuil_prod+= '    w.document.write(html_tableau);';
    feuil_prod+= '    w.document.close();';
    feuil_prod+= '    document.form_prod.Liste.selectedIndex = 0;';
    feuil_prod+= '}';


//////////////////////////////////////////////////
//
//          MODULE CALCUL PLAT
//
//////////////////////////////////////////////////


// Code pour la liste des jours de la semaine
var liste_jour = '<form name="form_jour" id="FORM_CALC_PLAT">';
	liste_jour+= '	 <select name="Liste" onchange="calc_plat(this.value)">';
	liste_jour+= '	 	<option selected="selected" value="0">VERIFICATION %</option>';
	liste_jour+= '		<option value="1">SEMAINE</option>';
	liste_jour+= '		<option value="2">LUNDI</option>';
	liste_jour+= '		<option value="3">MARDI</option>';
	liste_jour+= '		<option value="4">MERCREDI</option>';
	liste_jour+= '		<option value="5">JEUDI</option>';
	liste_jour+= '		<option value="6">VENDREDI</option>';
    liste_jour+= '	 </select>';
	liste_jour+= '</form>';

// Code pour le calcul des catégories
var calcul = 'function calc_plat(id) {';
    calcul+= '    var numero = "";';
    calcul+= '    var nb_entree = 0;';
    calcul+= '    var nb_plat = 0;';
    calcul+= '    var nb_legume = 0;';
    calcul+= '    var nb_dessert = 0;';
    calcul+= '    var nb_salad_bar = 0;';
    calcul+= '    var nb_dessert_bar = 0;';
    calcul+= '    if (id == 1) {';
    calcul+= '        var total_entree = 0;';
    calcul+= '        var total_plat = 0;';
    calcul+= '        var total_dessert = 0;';
    // Variable de stockage du total entrée/plat/dessert
    calcul+= '	      var stats_temp = [[0,0,0,0,0,0,nb_couverts(0)],[0,0,0,0,0,0,nb_couverts(1)],[0,0,0,0,0,0,nb_couverts(2)],[0,0,0,0,0,0,nb_couverts(3)],[0,0,0,0,0,0,nb_couverts(4)],[0,0,0,0,0,0,parseInt(nb_couverts(0))+parseInt(nb_couverts(1))+parseInt(nb_couverts(2))+parseInt(nb_couverts(3))+parseInt(nb_couverts(4))]];';
    // Boucle d'analyse quotidienne
    calcul+= '        for (id_jour = 0; id_jour < 5; id_jour++) {';
    calcul+= '           for (i = 0; i < categorie.length; i++) {';
    calcul+= '              numero = categorie[i][1];';
    calcul+= '              if (document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[0] != null) {';
    // IF = 1 ==> ENTREES ; IF = 2 ==> PLATS ; IF = 3 ==> DESSERTS ; IF == 4 ==> BOISSONS ; IF == 5 ==> LAITAGES
    calcul+= '                 if (categorie[i][3] == 1 || categorie[i][3] == 2 || categorie[i][3] == 3 || categorie[i][3] == 4 || categorie[i][3] == 5 || categorie[i][3] == 6){';
    calcul+= '                    stats_temp[id_jour][categorie[i][3] - 1] = stats_temp[id_jour][categorie[i][3] - 1] + parseInt(max_plat_categorie(numero, id_jour));';
    calcul+= '                    stats_temp[5][categorie[i][3] - 1] = stats_temp[5][categorie[i][3] - 1] + parseInt(max_plat_categorie(numero, id_jour));';
    calcul+= '                 }';
    calcul+= '              }';
    calcul+= '           }';
    calcul+= '        }';
// Code HTML
    calcul+= '        html_tableau = "<table id=\'entree\' width=100% style=\'border-collapse : collapse;\'>";';
    calcul+= '        html_tableau+= "    <caption style=\'border : 1px solid black; text-align : center; padding : 10px;font-size : 20px\'>SEMAINE du "+date_jour(0)+" au "+date_jour(4)+"</caption>";';
    calcul+= '        html_tableau+= "    <thead>";';
    calcul+= '        html_tableau+= "        <tr>";';
    calcul+= '        html_tableau+= "            <th width=10% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'></th>";';
    calcul+= '        html_tableau+= "            <th width=15% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>LUNDI - "+stats_temp[0][6]+"</th>";';
    calcul+= '        html_tableau+= "            <th width=15% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>MARDI - "+stats_temp[1][6]+"</th>";';
    calcul+= '        html_tableau+= "            <th width=15% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>MERCREDI - "+stats_temp[2][6]+"</th>";';
    calcul+= '        html_tableau+= "            <th width=15% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>JEUDI - "+stats_temp[3][6]+"</th>";';
    calcul+= '        html_tableau+= "            <th width=15% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>VENDREDI - "+stats_temp[4][6]+"</th>";';
    calcul+= '        html_tableau+= "            <th width=15% style=\'padding : 5px; padding-top : 10px; font-size : 14px;\'>TOTAL - "+stats_temp[5][6]+"</th>";';
    calcul+= '        html_tableau+= "        </tr>";';
    calcul+= '        html_tableau+= "    </thead>";';
    calcul+= '        var menu_type = ["ENTREES","PLATS","LEGUMES","DESSERTS","BOISSONS","LAITAGES"];';
    calcul+= '            for (i = 0; i < 6; i++) {';
    calcul+= '        html_tableau+= "        <tr style=\'font-size : small;\'>";';
    calcul+= '        html_tableau+= "            <td style=\'border : 1px solid black; padding : 4px; font-size : 10px\'>"+menu_type[i]+"</td>";';
    calcul+= '                for (j = 0; j < 6; j++) {';
	calcul+= '                   var color = "background-color : #FFFFFF;";';
	calcul+= '                   var pourcent_temp = stats_temp[j][i] / stats_temp[j][6] * 100;';
	calcul+= '                   if (i == 0) {';
	calcul+= '                       if (pourcent_temp < 20 || pourcent_temp > 35){color = "background-color : #FF6347; font-weight: bold;";}';
	calcul+= '                   } else if (i == 1) {';
	calcul+= '                       if (pourcent_temp < 80 || pourcent_temp > 100){color = "background-color : #FF6347; font-weight: bold;";}';
	calcul+= '                   } else if (i == 2) {';
	calcul+= '                       if (pourcent_temp < 70 || pourcent_temp > 100){color = "background-color : #FF6347; font-weight: bold;";}';
	calcul+= '                   } else if (i == 3) {';
	calcul+= '                       if (pourcent_temp < 20 || pourcent_temp > 50){color = "background-color : #FF6347; font-weight: bold;";}';
	calcul+= '                   }';
    calcul+= '        html_tableau+= "            <td style=\'border : 1px solid black; "+color+"text-align : center; padding : 4px; font-size : 10px;\'>"+stats_temp[j][i]+"  [ "+pourcent_temp.toFixed(1)+" % ]"+"</td>";';
    calcul+= '                }';
    calcul+= '        html_tableau+= "        </tr>";';
    calcul+= '        html_tableau+= "<tr><td style=\'padding : 3px; font-size : 5px\'>&nbsp;</td></tr>";';
    calcul+= '            }';
    calcul+= '        html_tableau+= "</table>";';
    // création de la page HTML
    calcul+= '    w = open("","Print_page","width=900,height=300,toolbar=no,scrollbars=yes,resizable=yes");';
    calcul+= '    w.document.write(html_tableau);';
    calcul+= '    w.document.close();';
	calcul+= '    } else if (id > 1) {';
	calcul+= '        var id_jour = id - 2;';
	calcul+= '        var nb_couvert = nb_couverts(id_jour);';
    calcul+= '	      for (i = 0; i < categorie.length; i++) {';
    calcul+= '            numero = categorie[i][1];';
    calcul+= '            if (document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[id_jour] != null) {';
    calcul+= '                if (categorie[i][3] == 1) {';
    calcul+= '                    nb_entree = nb_entree + parseInt(max_plat_categorie(numero, id_jour));';
    calcul+= '                } else if (categorie[i][3] == 2) {';
    calcul+= '                    nb_plat = nb_plat + parseInt(max_plat_categorie(numero, id_jour));';
    calcul+= '                } else if (categorie[i][3] == 3) {';
    calcul+= '                    nb_legume = nb_legume + parseInt(max_plat_categorie(numero, id_jour));';
    calcul+= '                } else if (categorie[i][3] == 4) {';
    calcul+= '                    nb_dessert = nb_dessert + parseInt(max_plat_categorie(numero, id_jour));';
    calcul+= '                } else if (categorie[i][3] == 7) {';
    calcul+= '                    nb_salad_bar = nb_salad_bar + parseInt(max_plat_categorie(numero, id_jour));';
    calcul+= '                } else if (categorie[i][3] == 8) {';
    calcul+= '                    nb_dessert_bar = nb_dessert_bar + parseInt(max_plat_categorie(numero, id_jour));';
    calcul+= '                }';
    calcul+= '            }';
    calcul+= '        }';
	calcul+= '        var pourcent_veget = (nb_couvert - nb_plat) / nb_couvert * 100;';
	calcul+= '        var pourcent_plat = nb_plat / nb_couvert * 100;';
	calcul+= '        var pourcent_legume = nb_legume / nb_couvert * 100;';
	calcul+= '        var pourcent_entree = nb_entree / nb_couvert * 100;';
	calcul+= '        var pourcent_dessert = nb_dessert / nb_couvert * 100;';
	calcul+= '        var sans_plat = nb_couvert - nb_plat;';
	calcul+= '        var nb_salad_bar_obj = nb_couvert * 0.05 / 0.85;';
	calcul+= '        var nb_dessert_bar_obj = nb_couvert * 0.065 / 0.60;';
	calcul+= '		  var alert_resultat = "Nombre de couverts : "+nb_couvert+" \\n";';
	calcul+= '		      alert_resultat+= "\\n";';
	calcul+= '		      alert_resultat+= "Nombre d\'entrees : "+nb_entree+"  [ "+pourcent_entree.toFixed(1)+" % ]\\n";';
	calcul+= '		      alert_resultat+= "Nombre de plats : "+nb_plat+"  [ "+pourcent_plat.toFixed(1)+" % ]\\n";';
	calcul+= '		      alert_resultat+= "Nombre de légumes : "+nb_legume+"  [ "+pourcent_legume.toFixed(1)+" % ]\\n";';
	calcul+= '		      alert_resultat+= "Nombre de desserts : "+nb_dessert+"  [ "+pourcent_dessert.toFixed(1)+" % ]\\n";';
	calcul+= '		      alert_resultat+= "\\n";';
	calcul+= '		      alert_resultat+= "Sans plat : "+sans_plat+"  [ "+pourcent_veget.toFixed(1)+" % ]\\n";';
  	calcul+= '		      alert_resultat+= "\\n";';
  	calcul+= '		      alert_resultat+= "Salad\'BAR : "+nb_salad_bar+" Kg en BRUT  [ Objectif : "+nb_salad_bar_obj.toFixed(1)+" Kg ]\\n";';
  	calcul+= '		      alert_resultat+= "Dessert\'BAR : "+nb_dessert_bar+" Kg en BRUT  [ Objectif : "+nb_dessert_bar_obj.toFixed(1)+" Kg ]";';
    calcul+= '        alert(alert_resultat);';
	calcul+= '    }';
    calcul+= '        document.form_jour.Liste.selectedIndex = 0;';
    calcul+= '}';

//////////////////////////////////////////////////
//
//          MODULE FEUILLE DE PRIX
//
//////////////////////////////////////////////////


// Code pour la liste des jours de la semaine
var liste_jour_prix = '<form name="form_prix" id="FORM_FEUIL_PRIX">';
	liste_jour_prix+= '	 <select name="Liste" onchange="feuil_prix(this.value)">';
	liste_jour_prix+= '		<option selected="selected" value="0">FEUIL PRIX</option>';
	liste_jour_prix+= '		<option value="1">LUNDI</option>';
	liste_jour_prix+= '		<option value="2">MARDI</option>';
	liste_jour_prix+= '		<option value="3">MERCREDI</option>';
	liste_jour_prix+= '		<option value="4">JEUDI</option>';
	liste_jour_prix+= '		<option value="5">VENDREDI</option>';
    liste_jour_prix+= '	 </select>';
	liste_jour_prix+= '</form>';

var feuil_prix = 'function feuil_prix(id_jour) {';
    feuil_prix+= '    var id_jour = id_jour - 1;';
    feuil_prix+= '        var numero = "";';
    // BOUTON IMPRESSION
    feuil_prix+= '        html_tableau = "<input type=\'button\' onClick=\'window.print()\' value=\'IMPRESSION\' />";';
    // CREATION DU TABLEAU
    feuil_prix+= '        html_tableau+= "<table width=1100px>";';
    feuil_prix+= '        html_tableau+= "    <caption style=\'border : 1px solid black; text-align : center; padding : 8px;\'>"+nom_jour(id_jour)+" "+date_jour(id_jour)+" : "+nb_couverts(id_jour)+" couverts</caption>";';
    feuil_prix+= '        html_tableau+= "    <tbody>";';
    feuil_prix+= '        html_tableau+= "    <tr valign=top>";';
    feuil_prix+= '    for (cat_plat = 1; cat_plat < 4; cat_plat++) {';
    feuil_prix+= '        html_tableau+= "        <td>";';
    feuil_prix+= '        html_tableau+= "            <table style=\'border-collapse : collapse; font-size : 11px;\'>";';
    feuil_prix+= '            for (i = 0; i < categorie.length; i++) {';
    feuil_prix+= '                numero = categorie[i][1];';
    feuil_prix+= '              if (document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[id_jour] != null) {';
    feuil_prix+= '                if (categorie[i][4] == cat_plat && max_plat_categorie(numero, id_jour) > 0) {';
    feuil_prix+= '        html_tableau+= "                    <tr><td colspan=\'2\' style=\'border : 1px solid black; padding : 2px; font-size : 12px; text-align : center;\'><b>"+categorie[i][0]+"</b></td></tr>";';
    feuil_prix+= '                    for (j = 0; j < max_recette(numero, id_jour); j++) {';
    feuil_prix+= '                        if (qte_recette(numero,id_jour,j) > 0) {';
    feuil_prix+= '        html_tableau+= "                    <tr>";';
    feuil_prix+= '        html_tableau+= "                        <td width=330px style=\'border : 1px solid black; padding : 2px;\'>"+nom_recette(numero,id_jour,j).toLowerCase()+"</td>";';
    feuil_prix+= '        html_tableau+= "                        <td width=35px style=\'border : 1px solid black; text-align : right;\'>"+prix_recette(numero,id_jour,j)+"</td>";';
    feuil_prix+= '        html_tableau+= "                    </tr>";';
    feuil_prix+= '                        }';
    feuil_prix+= '                    }';
    feuil_prix+= '        html_tableau+= "                    <tr><td style=\'border : 1px solid black; padding : 2px;\'>&nbsp;</td><td style=\'border : 1px solid black; padding : 5px;\'></td></tr>";';
    feuil_prix+= '        html_tableau+= "                    <tr><td>&nbsp;</td></tr>";';
    feuil_prix+= '                }';
    feuil_prix+= '              }';
    feuil_prix+= '            }';
    feuil_prix+= '            if (cat_plat == 2) {';
    feuil_prix+= '        html_tableau+= "                    <tr><td colspan=\'2\' style=\'border : 1px solid black; padding : 2px; font-size : 12px; text-align : center;\'><b>MENU MALIN</b></td></tr>";';
    feuil_prix+= '        html_tableau+= "                    <tr><td colspan=\'2\' style=\'border : 1px solid black; padding : 2px; font-size : 12px; text-align : center;\'>&nbsp;</td></tr>";';
    feuil_prix+= '        html_tableau+= "                    <tr><td colspan=\'2\' style=\'border : 1px solid black; padding : 2px; font-size : 12px; text-align : center;\'>&nbsp;</td></tr>";';
    feuil_prix+= '        html_tableau+= "                    <tr><td colspan=\'2\' style=\'border : 1px solid black; padding : 2px; font-size : 12px; text-align : center;\'>&nbsp;</td></tr>";';
    feuil_prix+= '            }';
    feuil_prix+= '            if (cat_plat == 3) {';
    feuil_prix+= '        html_tableau+= "                    <tr><td>&nbsp;</td></tr>";';
    feuil_prix+= '        html_tableau+= "                    <tr><td>&nbsp;</td></tr>";';
    feuil_prix+= '        html_tableau+= "                    <tr><td colspan=\'2\' style=\'border : 1px solid black; padding : 2px; font-size : 12px; text-align : center;\'><b>SOUPE</b></td></tr>";';
    feuil_prix+= '        html_tableau+= "                    <tr><td colspan=\'2\' style=\'border : 1px solid black; padding : 2px; font-size : 12px; text-align : center;\'>&nbsp;</td></tr>";';
    feuil_prix+= '            }';
    feuil_prix+= '        html_tableau+= "            </table>";';
    feuil_prix+= '        html_tableau+= "        </td>";';
    feuil_prix+= '    }';
    feuil_prix+= '        html_tableau+= "    </tr>";';
    feuil_prix+= '        html_tableau+= "    </tbody>";';
    feuil_prix+= '        html_tableau+= "</table>";';
    // création de la page HTML
    feuil_prix+= '    w = open("","Print_page","width=1120,height=800,toolbar=no,scrollbars=no,resizable=no");';
    feuil_prix+= '    w.document.write(html_tableau);';
    feuil_prix+= '    w.document.close();';
    feuil_prix+= '    document.form_prix.Liste.selectedIndex = 0;';
    feuil_prix+= '}';



//////////////////////////////////////////////////
//
//          MODULE ECHANTILLON
//
//////////////////////////////////////////////////


// Code pour la liste des jours de la semaine echantillons
var liste_jour_echantillon = '<form name="form_echantillon" id="FORM_ECHANTILLON">';
	liste_jour_echantillon+= '	 <select name="Liste" onchange="feuil_echantillon(this.value)">';
	liste_jour_echantillon+= '		<option selected="selected" value="0">ECHANTILLON</option>';
	liste_jour_echantillon+= '		<option value="1">LUNDI</option>';
	liste_jour_echantillon+= '		<option value="2">MARDI</option>';
	liste_jour_echantillon+= '		<option value="3">MERCREDI</option>';
	liste_jour_echantillon+= '		<option value="4">JEUDI</option>';
	liste_jour_echantillon+= '		<option value="5">VENDREDI</option>';
    liste_jour_echantillon+= '	 </select>';
	liste_jour_echantillon+= '</form>';

var feuil_echantillon = 'function feuil_echantillon(id_jour) {';
    feuil_echantillon+= '    var id_jour = id_jour - 1;';
    feuil_echantillon+= '        var numero = "";';
    // BOUTON IMPRESSION
    feuil_echantillon+= '        html_tableau = "<input type=\'button\' onClick=\'window.print()\' value=\'IMPRESSION\' />";';
    // CREATION DU TABLEAU
    feuil_echantillon+= '        html_tableau+= "<table width=1100px>";';
    feuil_echantillon+= '        html_tableau+= "    <caption style=\'border : 1px solid black; text-align : center; padding : 8px;\'>"+nom_jour(id_jour)+" "+date_jour(id_jour)+" : "+nb_couverts(id_jour)+"</caption>";';
    feuil_echantillon+= '        html_tableau+= "    <tbody>";';
    feuil_echantillon+= '        html_tableau+= "    <tr valign=top>";';
    feuil_echantillon+= '    for (cat_plat = 1; cat_plat < 4; cat_plat++) {';
    feuil_echantillon+= '                if (cat_plat == 1){';
    feuil_echantillon+= '                    var nb_ech = 1;';
    feuil_echantillon+= '                } else if (cat_plat == 2){';
    feuil_echantillon+= '                    var nb_ech = 100;';
    feuil_echantillon+= '                } else if (cat_plat == 3){';
    feuil_echantillon+= '                    var nb_ech = 200;';
    feuil_echantillon+= '                }';
    feuil_echantillon+= '        html_tableau+= "        <td>";';
    feuil_echantillon+= '        html_tableau+= "            <table style=\'border-collapse : collapse; font-size : 11px;\'>";';
    feuil_echantillon+= '            for (i = 0; i < categorie.length; i++) {';
    feuil_echantillon+= '                numero = categorie[i][1];';
    feuil_echantillon+= '            if (document.getElementsByClassName("food"+numero+" dishtype  noguideline ")[id_jour] != null) {';
    feuil_echantillon+= '                if (categorie[i][4] == cat_plat && max_plat_categorie(numero, id_jour) > 0) {';
    feuil_echantillon+= '        html_tableau+= "                    <tr><td colspan=\'2\' style=\'border : 1px solid black; padding : 2px; font-size : 12px; text-align : center;\'><b>"+categorie[i][0]+"</b></td></tr>";';
    feuil_echantillon+= '                    for (j = 0; j < max_recette(numero, id_jour); j++) {';
    feuil_echantillon+= '                        if (qte_recette(numero,id_jour,j) > 0) {';
    feuil_echantillon+= '        html_tableau+= "                    <tr>";';
    feuil_echantillon+= '        html_tableau+= "                        <td width=330px style=\'border : 1px solid black; padding : 2px;\'>"+nom_recette(numero,id_jour,j).toLowerCase()+"</td>";';
    feuil_echantillon+= '        html_tableau+= "                        <td width=35px style=\'border : 1px solid black; font-size : 13px; text-align : center;\'><b>"+nb_ech+"</b></td>";';
    feuil_echantillon+= '                         nb_ech = nb_ech + 1;';
    feuil_echantillon+= '        html_tableau+= "                    </tr>";';
    feuil_echantillon+= '                        }';
    feuil_echantillon+= '                    }';
    feuil_echantillon+= '        html_tableau+= "                    <tr><td style=\'border : 1px solid black; padding : 2px;\'>&nbsp;</td><td style=\'border : 1px solid black; padding : 5px;\'></td></tr>";';
    feuil_echantillon+= '        html_tableau+= "                    <tr><td>&nbsp;</td></tr>";';
    feuil_echantillon+= '                }';
    feuil_echantillon+= '              }';
    feuil_echantillon+= '            }';
    feuil_echantillon+= '        html_tableau+= "            </table>";';
    feuil_echantillon+= '        html_tableau+= "        </td>";';
    feuil_echantillon+= '    }';
    feuil_echantillon+= '        html_tableau+= "    </tr>";';
    feuil_echantillon+= '        html_tableau+= "    </tbody>";';
    feuil_echantillon+= '        html_tableau+= "</table>";';
    // création de la page HTML
    feuil_echantillon+= '    w = open("","Print_page","width=1120,height=800,toolbar=no,scrollbars=yes,resizable=yes");';
    feuil_echantillon+= '    w.document.write(html_tableau);';
    feuil_echantillon+= '    w.document.close();';
    feuil_echantillon+= '    document.form_echantillon.Liste.selectedIndex = 0;';
    feuil_echantillon+= '}';



//////////////////////////////////////////////////
//
//          Insertion dans le code de la page
//
//////////////////////////////////////////////////

// Affiche les modules sur la page Menus
function locationHashChanged() {
    var $ = window.jQuery;
    var url = window.location.href;
    if (url == "https://portail-oscar.compass-group.fr/#/menus") {
        $("#nouveau_div").css("display","");
    } else {
        $("#nouveau_div").css("display","none");
    }
}

// Ajoute les menus/options sur OSCAR
var nouveauDiv = document.createElement("div");
nouveauDiv.id = "nouveau_div";
nouveauDiv.innerHTML = liste_menu();
nouveauDiv.innerHTML+= liste_jour_prod;
nouveauDiv.innerHTML+= liste_jour;
nouveauDiv.innerHTML+= liste_jour_prix;
nouveauDiv.innerHTML+= liste_jour_echantillon;
document.body.appendChild(nouveauDiv);

// Ajoute le javascript
var newElem = document.createElement('script');
newElem.type = 'text/javascript';
newElem.innerHTML = categorie;
newElem.innerHTML += fonctions;
newElem.innerHTML += hide_div;
newElem.innerHTML += feuil_prod;
newElem.innerHTML += calcul;
newElem.innerHTML += feuil_prix;
newElem.innerHTML += feuil_echantillon;
document.body.appendChild(newElem);

// Feuille de style
var $ = window.jQuery;
$("#nouveau_div").css("position", "absolute").css("top","45px").css("left","46%").css("display","none");
$("#FORM_AFFICHAGE_PLAT").css("float","left").css("margin-right","5px");
$("#FORM_FEUIL_PROD").css("float","left").css("margin-right","5px");
$("#FORM_CALC_PLAT").css("float","left").css("margin-right","5px");
$("#FORM_FEUIL_PRIX").css("float","left").css("margin-right","5px");
$("#FORM_ECHANTILLON").css("float","left").css("margin-right","5px");

window.onhashchange = locationHashChanged;
})();
