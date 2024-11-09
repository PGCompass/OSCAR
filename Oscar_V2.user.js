// ==UserScript==
// @name         OSCAR ALL
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Amélioration Oscar
// @author       Pierre GARDIE - Compass Group France
// @match        https://portail-oscar.compass-group.fr
// @updateURL    
// @downloadURL  
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //////////////////////////////////////////////////
    //
    //          BASE DE DONNEES
    //
    //////////////////////////////////////////////////

    const categorie_plat = [
        "<--TOUT-->", "ENTREES", "SALAD'BAR", "PLAT", "LEGUMES", "DESSERTS", "FRUIT'BAR", "BOISSONS", "LAITAGES", "DIVERS"
    ];

    const categorie = [
        ["Entrees", "3", 2, 1, 1], ["Entrees Chaudes", "1", 2, 1, 1], ["Entrees Dressees", "93", 2, 1, 1], ["Entree fixe", "8", 2, 1, 1], ["Grande Salade", "4", 2, 1, 1], ["Fromage", "66", 2, null, 1],
        ["Salade BAR", "33", 3, 7, 1], ["Topping", "90", 3, 7, 1],
        ["Bar a Soupe", "91", 4, null, 2], ["Bon par Nature", "42", 4, 2, 2], ["Comptoir du chef", "11", 4, 2, 2], ["Rotisserie", "53", 4, 2, 2], ["Plat du Jour", "41", 4, 2, 2], ["Cuisine du Monde", "18", 4, 2, 2],
        ["Fléxitarien", "187", 4, 2, 2], ["Burger and Co", "78", 4, 2, 2], ["Grillade", "51", 4, 2, 2], ["Trattoria", "82", 4, 2, 2], ["Cuisson minute", "35", 4, 2, 2], ["Peche du Jour", "44", 4, 2, 2],
        ["Plat Bistrot", "178", 4, 2, 2], ["Stand Express", "29", 4, 2, 2], ["Globe Cooker", "174", 4, 2, 2], ["Street Good", "175", 4, 2, 2], ["600 max", "98", 4, 2, 2], ["Les cocottes", "180", 4, 2, 2], ["Au naturel", "172", 4, 2, 2],
        ["Bar a legumes", "64", 5, 3, 2], ["Legumes", "56", 5, 3, 2], ["Accompagnements", "10", 5, 3, 2], ["Legumes fixe", "34", 5, 3, 2],
        ["Desserts", "70", 6, 4, 3], ["Desserts Dresses", "28", 6, 4, 3], ["Patisserie Spectacle", "68", 6, 4, 3], ["Vente à emporter", "5", 6, null, 3],
        ["Bar a fruits", "61", 7, 8, 3], ["Dessert bar", "27", 7, 8, 3], ["Topping dessert", "214", 7, 8, 3],
        ["Divers", "9", 8, 5, null],
        ["Produits laitiers fixes", "25", 9, 6, null],
        ["Pains", "2", 10, null, null], ["Table a condiments", "97", 10, null, null], ["Fruits", "50", 10, null, null], ["Corbeille de Fruits", "77", 10, null, null]
    ];

    //////////////////////////////////////////////////
    //
    //          FONCTIONS UTILITAIRES
    //
    //////////////////////////////////////////////////

    function getElementByClass(className, index = 0) {
        return document.getElementsByClassName(className)[index];
    }

    function getInnerTextByClass(className, index = 0) {
        const element = getElementByClass(className, index);
        return element ? element.innerText : "";
    }

    function getInnerHTMLByClass(className, index = 0) {
        const element = getElementByClass(className, index);
        return element ? element.innerHTML : "";
    }

    function getElementsByClass(className) {
        return document.getElementsByClassName(className);
    }

    function showElementByClass(className, index = 0) {
        const element = getElementByClass(className, index);
        if (element) element.style.display = "";
    }

    function hideElementByClass(className, index = 0) {
        const element = getElementByClass(className, index);
        if (element) element.style.display = "none";
    }

    //////////////////////////////////////////////////
    //
    //          FONCTIONS PRINCIPALES
    //
    //////////////////////////////////////////////////

    function date_jour(id_jour) {
        return getInnerHTMLByClass("ribmenucol zflol week-5", id_jour).getElementsByClassName("tinylabel")[0];
    }

    function nom_jour(id_jour) {
        return getInnerHTMLByClass("ribmenucol zflol week-5", id_jour).getElementsByClassName("ztexb")[0];
    }

    function nb_couverts(id_jour) {
        return getInnerHTMLByClass("ribmenucol week-5 zflol zpadt0", id_jour).getElementsByClassName("zflor")[0].getElementsByClassName("ztexb")[0];
    }

    function nom_recette(id_food, id_jour, id_ligne) {
        return getInnerHTMLByClass(`food${id_food} dishtype noguideline `, id_jour).getElementsByClassName("article qz_Menus_Production_Recipe_Replacements_Show qz_Menus_Production_Recipe_ContextMenu")[id_ligne].split("(")[0];
    }

    function prix_recette(id_food, id_jour, id_ligne) {
        return getInnerHTMLByClass(`food${id_food} dishtype noguideline `, id_jour).getElementsByClassName("dishprice menu-calendar-price")[id_ligne].split(":")[1];
    }

    function qte_recette(id_food, id_jour, id_ligne) {
        const element = getInnerHTMLByClass(`food${id_food} dishtype noguideline `, id_jour).getElementsByClassName("dishprice menu-calendar-qty")[id_ligne];
        return element ? element.split(":")[1] : 0;
    }

    function max_recette(id_food, id_jour) {
        return getElementsByClass(`food${id_food} dishtype noguideline `, id_jour).getElementsByClassName("normal-icon icon-eye zpabs zr0 zt0 qz_Menus_Recipe_View").length;
    }

    function max_plat_categorie(id_food, id_jour) {
        return getElementsByClass(`food${id_food} dishtype noguideline `, id_jour).getElementsByClassName("dish-qty zpadr5 ztexr")[0].getElementsByClassName("zflor ")[0].innerHTML;
    }

    function liste_menu() {
        let options = categorie_plat.map((plat, index) => `<option value="${index + 1}">${plat}</option>`).join("");
        return `<form name="Choix" id="FORM_AFFICHAGE_PLAT">
                    <select name="Liste" onchange="hide_div(this.value)">
                        <option selected="selected" value="0">CATEGORIE</option>
                        ${options}
                        <option value="99">SANS PRIX</option>
                    </select>
                </form>`;
    }

    function hide_div(id) {
        let div_style = "";
        let nb_recette_sans_prix = 0;

        categorie.forEach(cat => {
            let numero = cat[1];
            for (let j = 0; j < 5; j++) {
                let element = getElementsByClass(`food${numero} dishtype noguideline `, j);
                if (element) {
                    showElementByClass(`food${numero} dishtype noguideline `, j);
                    for (let recette = 0; recette < max_recette(numero, j); recette++) {
                        showElementByClass("accordion", recette);
                        showElementByClass("bottom", recette);
                    }
                }
            }
        });

        if (id != 99) {
            categorie.forEach(cat => {
                let numero = cat[1];
                for (let j = 0; j < 5; j++) {
                    let element = getElementsByClass(`food${numero} dishtype noguideline `, j);
                    if (element) {
                        element.style.display = (id == 1 || id == cat[2]) ? "" : "none";
                    }
                }
            });
        } else {
            categorie.forEach(cat => {
                let numero = cat[1];
                for (let j = 0; j < 5; j++) {
                    let element = getElementsByClass(`food${numero} dishtype noguideline `, j);
                    if (element) {
                        for (let recette = 0; recette < max_recette(numero, j); recette++) {
                            if (prix_recette(numero, j, recette) == "0.00") {
                                nb_recette_sans_prix++;
                            } else {
                                hideElementByClass("accordion", recette);
                                hideElementByClass("bottom", recette);
                            }
                        }
                        if (nb_recette_sans_prix == 0) {
                            hideElementByClass(`food${numero} dishtype noguideline `, j);
                        }
                    }
                }
            });
        }

        document.Choix.Liste.selectedIndex = 0;
    }

    //////////////////////////////////////////////////
    //
    //          MODULE FEUILLE DE PRODUCTION & MENU
    //
    //////////////////////////////////////////////////

    function feuil_prod(id_jour) {
        id_jour -= 2;
        let html_tableau = `
            <script type="text/javascript">
                function feuil_prod_choix(id) {
                    document.getElementById('entree').style.display = id == 0 ? '' : 'none';
                    document.getElementById('plat').style.display = id == 1 ? '' : 'none';
                    document.getElementById('dessert').style.display = id == 2 ? '' : 'none';
                }
            </script>
            <form name="form_feuil_prod" id="FORM4">
                <select name="Liste_feuil_prod" onchange="feuil_prod_choix(this.value)">
                    <option selected="selected" value="0">ENTREES</option>
                    <option value="1">PLATS</option>
                    <option value="2">DESSERTS</option>
                </select>
                <input type="button" onClick="window.print()" value="IMPRESSION" />
            </form>
        `;

        ["ENTREES", "PLATS", "DESSERTS"].forEach((type_plat, type_index) => {
            let id_style = type_plat.toLowerCase();
            let nb_ech = type_index * 100 || 1;
            let tab_style = type_index == 0 ? "" : "none";

            if (id_jour < 0) {
                html_tableau += `
                    <table width="100%" id="${id_style}" style="border-collapse: collapse; display: ${tab_style}">
                        <caption style="border: 1px solid black; text-align: center; padding: 10px; font-size: 20px">
                            SEMAINE du ${date_jour(0)} au ${date_jour(4)}
                        </caption>
                        <thead>
                            <tr>
                                <th width="10%" style="padding: 5px; padding-top: 10px; font-size: 14px;"></th>
                                <th width="18%" style="padding: 5px; padding-top: 10px; font-size: 14px;">LUNDI - ${nb_couverts(0)}</th>
                                <th width="18%" style="padding: 5px; padding-top: 10px; font-size: 14px;">MARDI - ${nb_couverts(1)}</th>
                                <th width="18%" style="padding: 5px; padding-top: 10px; font-size: 14px;">MERCREDI - ${nb_couverts(2)}</th>
                                <th width="18%" style="padding: 5px; padding-top: 10px; font-size: 14px;">JEUDI - ${nb_couverts(3)}</th>
                                <th width="18%" style="padding: 5px; padding-top: 10px; font-size: 14px;">VENDREDI - ${nb_couverts(4)}</th>
                            </tr>
                        </thead>
                `;

                categorie.forEach(cat => {
                    let numero = cat[1];
                    if (getElementsByClass(`food${numero} dishtype noguideline `, 0)) {
                        if (cat[4] == type_index + 1) {
                            let menu_temp = [[], [], [], [], []];
                            let cat_max = 0;

                            for (let id_jour_bis = 0; id_jour_bis < 5; id_jour_bis++) {
                                if (cat_max < max_recette(numero, id_jour_bis)) {
                                    cat_max = max_recette(numero, id_jour_bis);
                                }
                            }

                            for (let j = 0; j < cat_max; j++) {
                                for (let id_jour_bis = 0; id_jour_bis < 5; id_jour_bis++) {
                                    if (qte_recette(numero, id_jour_bis, j) > 0) {
                                        menu_temp[id_jour_bis].push(`${qte_recette(numero, id_jour_bis, j)} x ${nom_recette(numero, id_jour_bis, j)}`);
                                    }
                                }
                            }

                            let menu_temp_max = 0;
                            for (let id_jour_bis = 0; id_jour_bis < 5; id_jour_bis++) {
                                if (menu_temp_max < menu_temp[id_jour_bis].length) {
                                    menu_temp_max = menu_temp[id_jour_bis].length;
                                }
                            }

                            if (menu_temp_max > 0) {
                                for (let id_menu = 0; id_menu < menu_temp_max; id_menu++) {
                                    html_tableau += "<tr style='font-size: small;'>";
                                    html_tableau += `<td style='border: 1px solid black; padding: 4px; font-size: 10px'>${cat[0]}</td>`;
                                    for (let id_jour_bis = 0; id_jour_bis < 5; id_menu++) {
                                        if (menu_temp[id_jour_bis][id_menu] != null) {
                                            html_tableau += `<td style='border: 1px solid black; text-align: center; padding: 4px; font-size: 10px;'>${menu_temp[id_jour_bis][id_menu]}</td>`;
                                        } else {
                                            html_tableau += "<td style='border: 1px solid black; text-align: center; padding: 4px; font-size: 10px;'>&nbsp</td>";
                                        }
                                    }
                                    html_tableau += "</tr>";
                                }
                                html_tableau += "<tr><td style='padding: 3px; font-size: 5px'>&nbsp;</td></tr>";
                            }
                        }
                    }
                });

                html_tableau += "</table>";
            } else {
                html_tableau += `
                    <table width="100%" id="${id_style}" style="border-collapse: collapse; display: ${tab_style}">
                        <caption style="border: 1px solid black; text-align: center; padding: 15px;">
                            ${nom_jour(id_jour)} ${date_jour(id_jour)} : ${nb_couverts(id_jour)} Couverts
                        </caption>
                        <thead>
                            <tr>
                                <th style="padding: 5px; padding-top: 30px;">TYPE</th>
                                <th style="padding: 5px; padding-top: 30px;">#</th>
                                <th style="padding: 5px; padding-top: 30px;">${type_plat}</th>
                                <th style="padding: 5px; padding-top: 30px;">PV</th>
                                <th style="padding: 5px; padding-top: 30px;">QTE</th>
                                <th style="padding: 5px; padding-top: 30px;">FAIT</th>
                            </tr>
                        </thead>
                `;

                let nb_type_plat = 0;
                categorie.forEach(cat => {
                    let numero = cat[1];
                    if (cat[4] == type_index + 1 && getElementsByClass(`food${numero} dishtype noguideline `, id_jour)) {
                        for (let j = 0; j < max_recette(numero, id_jour); j++) {
                            if (qte_recette(numero, id_jour, j) > 0) {
                                html_tableau += "<tr style='font-size: small;'>";
                                html_tableau += `<td style='border: 1px solid black; padding: 5px;'>${cat[0]}</td>`;
                                html_tableau += `<td style='border: 1px solid black; text-align: center; padding: 5px;'>${nb_ech}</td>`;
                                html_tableau += `<td style='border: 1px solid black; padding: 5px;'>${nom_recette(numero, id_jour, j)}</td>`;
                                html_tableau += `<td style='border: 1px solid black; text-align: right; padding: 5px;'>${prix_recette(numero, id_jour, j)}</td>`;
                                html_tableau += `<td style='border: 1px solid black; text-align: right; padding: 5px;'>${qte_recette(numero, id_jour, j)}</td>`;
                                html_tableau += "<td style='border: 1px solid black; text-align: right; padding: 5px;'></td>";
                                html_tableau += "</tr>";
                                nb_ech += 1;
                            }
                            if (cat[3] == type_index + 1 && !nom_recette(numero, id_jour, j).startsWith("SCE")) {
                                nb_type_plat += parseInt(qte_recette(numero, id_jour, j));
                            }
                        }
                        if (max_plat_categorie(numero, id_jour) > 0) {
                            html_tableau += "<tr><td>&nbsp;</td></tr>";
                        }
                    }
                });

                html_tableau += `
                    <tr style='font-size: small;'>
                        <td style='border: 1px solid black; padding: 5px;'>TOTAL :</td>
                        <td style='border: 1px solid black; padding: 5px;'></td>
                        <td style='border: 1px solid black; text-align: right; padding: 5px;'>TAUX DE PRISE</td>
                        <td style='border: 1px solid black; text-align: center; padding: 5px;'>${(nb_type_plat / nb_couverts(id_jour) * 100).toFixed(1)} %</td>
                        <td style='border: 1px solid black; text-align: right; padding: 5px;'>${nb_type_plat}</td>
                        <td style='border: 1px solid black; padding: 5px;'></td>
                    </tr>
                    </table>
                `;
            }
        });

        // Création de la page HTML
        const w = open("", "Print_page", "width=800,height=1000,toolbar=no,scrollbars=yes,resizable=yes");
        w.document.write(html_tableau);
        w.document.close();
        document.form_prod.Liste.selectedIndex = 0;
    }

    //////////////////////////////////////////////////
    //
    //          MODULE CALCUL PLAT
    //
    //////////////////////////////////////////////////

    function calc_plat(id) {
        let stats_temp = [[0, 0, 0, 0, 0, 0, nb_couverts(0)], [0, 0, 0, 0, 0, 0, nb_couverts(1)], [0, 0, 0, 0, 0, 0, nb_couverts(2)], [0, 0, 0, 0, 0, 0, nb_couverts(3)], [0, 0, 0, 0, 0, 0, nb_couverts(4)], [0, 0, 0, 0, 0, 0, parseInt(nb_couverts(0)) + parseInt(nb_couverts(1)) + parseInt(nb_couverts(2)) + parseInt(nb_couverts(3)) + parseInt(nb_couverts(4))]];

        if (id == 1) {
            for (let id_jour = 0; id_jour < 5; id_jour++) {
                categorie.forEach(cat => {
                    let numero = cat[1];
                    if (getElementsByClass(`food${numero} dishtype noguideline `, 0)) {
                        if ([1, 2, 3, 4, 5, 6].includes(cat[3])) {
                            stats_temp[id_jour][cat[3] - 1] += parseInt(max_plat_categorie(numero, id_jour));
                            stats_temp[5][cat[3] - 1] += parseInt(max_plat_categorie(numero, id_jour));
                        }
                    }
                });
            }

            let html_tableau = `
                <table id='entree' width='100%' style='border-collapse: collapse;'>
                    <caption style='border: 1px solid black; text-align: center; padding: 10px; font-size: 20px;'>SEMAINE du ${date_jour(0)} au ${date_jour(4)}</caption>
                    <thead>
                        <tr>
                            <th width='10%' style='padding: 5px; padding-top: 10px; font-size: 14px;'></th>
                            <th width='15%' style='padding: 5px; padding-top: 10px; font-size: 14px;'>LUNDI - ${stats_temp[0][6]}</th>
                            <th width='15%' style='padding: 5px; padding-top: 10px; font-size: 14px;'>MARDI - ${stats_temp[1][6]}</th>
                            <th width='15%' style='padding: 5px; padding-top: 10px; font-size: 14px;'>MERCREDI - ${stats_temp[2][6]}</th>
                            <th width='15%' style='padding: 5px; padding-top: 10px; font-size: 14px;'>JEUDI - ${stats_temp[3][6]}</th>
                            <th width='15%' style='padding: 5px; padding-top: 10px; font-size: 14px;'>VENDREDI - ${stats_temp[4][6]}</th>
                            <th width='15%' style='padding: 5px; padding-top: 10px; font-size: 14px;'>TOTAL - ${stats_temp[5][6]}</th>
                        </tr>
                    </thead>
            `;

            let menu_type = ["ENTREES", "PLATS", "LEGUMES", "DESSERTS", "BOISSONS", "LAITAGES"];
            menu_type.forEach((type, i) => {
                html_tableau += `<tr style='font-size: small;'><td style='border: 1px solid black; padding: 4px; font-size: 10px'>${type}</td>`;
                for (let j = 0; j < 6; j++) {
                    let pourcent_temp = (stats_temp[j][i] / stats_temp[j][6]) * 100;
                    let color = "background-color: #FFFFFF;";
                    if ([0, 3].includes(i) && (pourcent_temp < 20 || pourcent_temp > 35)) {
                        color = "background-color: #FF6347; font-weight: bold;";
                    } else if (i == 1 && (pourcent_temp < 80 || pourcent_temp > 100)) {
                        color = "background-color: #FF6347; font-weight: bold;";
                    } else if (i == 2 && (pourcent_temp < 70 || pourcent_temp > 100)) {
                        color = "background-color: #FF6347; font-weight: bold;";
                    }
                    html_tableau += `<td style='border: 1px solid black; ${color} text-align: center; padding: 4px; font-size: 10px;'>${stats_temp[j][i]}  [ ${pourcent_temp.toFixed(1)} % ]</td>`;
                }
                html_tableau += "</tr><tr><td style='padding: 3px; font-size: 5px'>&nbsp;</td></tr>";
            });

            html_tableau += "</table>";

            const w = open("", "Print_page", "width=900,height=300,toolbar=no,scrollbars=yes,resizable=yes");
            w.document.write(html_tableau);
            w.document.close();
        } else if (id > 1) {
            let id_jour = id - 2;
            let nb_couvert = nb_couverts(id_jour);

            let nb_entree = 0, nb_plat = 0, nb_legume = 0, nb_dessert = 0, nb_salad_bar = 0, nb_dessert_bar = 0;
            categorie.forEach(cat => {
                let numero = cat[1];
                if (getElementsByClass(`food${numero} dishtype noguideline `, id_jour)) {
                    switch (cat[3]) {
                        case 1: nb_entree += parseInt(max_plat_categorie(numero, id_jour)); break;
                        case 2: nb_plat += parseInt(max_plat_categorie(numero, id_jour)); break;
                        case 3: nb_legume += parseInt(max_plat_categorie(numero, id_jour)); break;
                        case 4: nb_dessert += parseInt(max_plat_categorie(numero, id_jour)); break;
                        case 7: nb_salad_bar += parseInt(max_plat_categorie(numero, id_jour)); break;
                        case 8: nb_dessert_bar += parseInt(max_plat_categorie(numero, id_jour)); break;
                    }
                }
            });

            let pourcent_veget = ((nb_couvert - nb_plat) / nb_couvert) * 100;
            let pourcent_plat = (nb_plat / nb_couvert) * 100;
            let pourcent_legume = (nb_legume / nb_couvert) * 100;
            let pourcent_entree = (nb_entree / nb_couvert) * 100;
            let pourcent_dessert = (nb_dessert / nb_couvert) * 100;
            let sans_plat = nb_couvert - nb_plat;
            let nb_salad_bar_obj = (nb_couvert * 0.05) / 0.85;
            let nb_dessert_bar_obj = (nb_couvert * 0.065) / 0.60;

            alert(`Nombre de couverts : ${nb_couvert}
                Nombre d'entrees : ${nb_entree}  [ ${pourcent_entree.toFixed(1)} % ]
                Nombre de plats : ${nb_plat}  [ ${pourcent_plat.toFixed(1)} % ]
                Nombre de légumes : ${nb_legume}  [ ${pourcent_legume.toFixed(1)} % ]
                Nombre de desserts : ${nb_dessert}  [ ${pourcent_dessert.toFixed(1)} % ]
                Sans plat : ${sans_plat}  [ ${pourcent_veget.toFixed(1)} % ]
                Salad'BAR : ${nb_salad_bar} Kg en BRUT  [ Objectif : ${nb_salad_bar_obj.toFixed(1)} Kg ]
                Dessert'BAR : ${nb_dessert_bar} Kg en BRUT  [ Objectif : ${nb_dessert_bar_obj.toFixed(1)} Kg ]`);
        }

        document.form_jour.Liste.selectedIndex = 0;
    }

    //////////////////////////////////////////////////
    //
    //          MODULE FEUILLE DE PRIX
    //
    //////////////////////////////////////////////////

    function feuil_prix(id_jour) {
        id_jour -= 1;
        let html_tableau = `
            <input type="button" onClick="window.print()" value="IMPRESSION" />
            <table width="1100px">
                <caption style="border: 1px solid black; text-align: center">
                    ${nom_jour(id_jour)} ${date_jour(id_jour)} : ${nb_couverts(id_jour)} Couverts
                </caption>
                <thead>
                    <tr>
                        <th style="padding: 5px; padding-top: 30px;">TYPE</th>
                        <th style="padding: 5px; padding-top: 30px;">#</th>
                        <th style="padding: 5px; padding-top: 30px;">DESCRIPTION</th>
                        <th style="padding: 5px; padding-top: 30px;">PV</th>
                        <th style="padding: 5px; padding-top: 30px;">QTE</th>
                        <th style="padding: 5px; padding-top: 30px;">FAIT</th>
                    </tr>
                </thead>
        `;

        categorie.forEach(cat => {
            let numero = cat[1];
            if (getElementsByClass(`food${numero} dishtype noguideline `, id_jour)) {
                for (let j = 0; j < max_recette(numero, id_jour); j++) {
                    if (qte_recette(numero, id_jour, j) > 0) {
                        html_tableau += "<tr style='font-size: small;'>";
                        html_tableau += `<td style='border: 1px solid black; padding: 5px;'>${cat[0]}</td>`;
                        html_tableau += `<td style='border: 1px solid black; text-align: center; padding: 5px;'>${j + 1}</td>`;
                        html_tableau += `<td style='border: 1px solid black; padding: 5px;'>${nom_recette(numero, id_jour, j)}</td>`;
                        html_tableau += `<td style='border: 1px solid black; text-align: right; padding: 5px;'>${prix_recette(numero, id_jour, j)}</td>`;
                        html_tableau += `<td style='border: 1px solid black; text-align: right; padding: 5px;'>${qte_recette(numero, id_jour, j)}</td>`;
                        html_tableau += "<td style='border: 1px solid black; text-align: right; padding: 5px;'></td>";
                        html_tableau += "</tr>";
                    }
                }
            }
        });

        html_tableau += "</table>";

        // Création de la page HTML
        const w = open("", "Print_page", "width=1100,height=600,toolbar=no,scrollbars=yes,resizable=yes");
        w.document.write(html_tableau);
        w.document.close();
        document.form_prix.Liste.selectedIndex = 0;
    }

    //////////////////////////////////////////////////
    //
    //          INITIALISATION
    //
    //////////////////////////////////////////////////

    function init() {
        const formContainer = document.createElement('div');
        formContainer.innerHTML = liste_menu();
        document.body.appendChild(formContainer);
    }

    window.addEventListener('load', init, false);

})();
