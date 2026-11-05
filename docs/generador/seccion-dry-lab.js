// Seccion dry lab del documento del medidor no invasivo de glucosa.
// Uso: const seccion = require("./seccion-dry-lab.js")(helpers) donde helpers = { P, H2, H3, B, N, figura, tabla, recuadro, codigo, link, rich }.
// Devuelve { metodologia, resultados, discusion, anexo, referencias }, cada uno un arreglo de bloques de docx.
// Las cifras de tablas salen de 3-analisis-de-viabilidad/resultados-calculos.json del repo (generado por 3-analisis-de-viabilidad/calculos_dry_lab.py).
// Las cifras citadas llevan su fuente en el texto y en la lista de referencias.
const fs = require("fs");
const path = require("path");
const { Paragraph } = require("docx");

const DRY_LAB = path.join(__dirname, "..", "..", "3-analisis-de-viabilidad");
const CALC = JSON.parse(fs.readFileSync(path.join(DRY_LAB, "resultados-calculos.json"), "utf8"));

const f = (x, d = 1) => Number(x).toFixed(d).replace(".", ",");
const pc = (x, d = 0) => `${f(100 * x, d)} %`;
const RJ = (s) => `[[${s}]]`;
const ROJO = "C0392B";
const ROJO_CLARO = "FBE7E4";

// Referencias nuevas de esta seccion, en APA 7. Cada una es [texto, url o null].
const REFS_APA = [
 [
  "Prebeck, A., Stahl, U., Koch, M., & Ntziachristos, V. (2025). Non-invasive glucose measurements in humans with time-gated mid-IR optoacoustic spectroscopy [Preprint]. medRxiv. ",
  "https://doi.org/10.1101/2025.03.12.25323511"
 ],
 [
  "Kang, J. W., Causey, J., Steenkamp, D., Park, S., Heise, H. M., Weber, A., Ntziachristos, V., Coutard, J. G., Kamath, A., Barman, I., Mäntele, W., Jue, M., & So, P. T. C. (2026). Workshop on noninvasive glucose monitoring 2025. {{Journal of Diabetes Science and Technology, 20}}(4), 1472-1479. ",
  "https://doi.org/10.1177/19322968261447289"
 ],
 [
  "Kaluza, M., Janik, S., Lubinski, T., Saita, M., Lachmann, P., Canini, L., Lepro, V., & Mäntele, W. (2025). Clinical validation of noninvasive blood glucose measurements by midinfrared spectroscopy. {{Communications Medicine, 5}}(1), Article 509. ",
  "https://doi.org/10.1038/s43856-025-01241-7"
 ],
 [
  "DiaMonTech AG. (2026). News [Página web]. ",
  "https://www.diamontech.com/news"
 ],
 [
  "Delbeck, S., & Heise, H. M. (2021). Evaluation of opportunities and limitations of mid-infrared skin spectroscopy for noninvasive blood glucose monitoring. {{Journal of Diabetes Science and Technology, 15}}(1), 19-27. ",
  "https://doi.org/10.1177/1932296820936639"
 ],
 [
  "Kottmann, J., Rey, J. M., & Sigrist, M. W. (2016). Mid-infrared photoacoustic detection of glucose in human skin: Towards non-invasive diagnostics. {{Sensors, 16}}(10), 1663. ",
  "https://doi.org/10.3390/s16101663"
 ],
 [
  "Kottmann, J., Rey, J. M., Luginbühl, J., Reichmann, E., & Sigrist, M. W. (2012). Glucose sensing in human epidermis using mid-infrared photoacoustic detection. {{Biomedical Optics Express, 3}}(4), 667-680. ",
  "https://doi.org/10.1364/BOE.3.000667"
 ],
 [
  "Kaysir, M. R., Song, J., Rassel, S., Aloraynan, A., & Ban, D. (2023). Progress and perspectives of mid-infrared photoacoustic spectroscopy for non-invasive glucose detection. {{Biosensors, 13}}(7), 716. ",
  "https://doi.org/10.3390/bios13070716"
 ],
 [
  "Smith, J. L. (2023). {{The pursuit of noninvasive glucose: \"Hunting the deceitful turkey\"}} (9th ed.). Diabetotech. ",
  "https://www.diabetotech.com/Hunting_The_Deceitful_Turkey"
 ],
 [
  "Lundsgaard-Nielsen, S. M., Pors, A., Banke, S. O., Henriksen, J. E., Hepp, D. K., & Weber, A. (2018). Critical-depth Raman spectroscopy enables home-use non-invasive glucose monitoring. {{PLOS ONE, 13}}(5), e0197134. ",
  "https://doi.org/10.1371/journal.pone.0197134"
 ],
 [
  "Pors, A., Korzeniowska, B., Rasmussen, M. T., Lorenzen, C. V., Rasmussen, K. G., Inglev, R., Philipps, A., Zschornack, E., Freckmann, G., Weber, A., & Hepp, K. D. (2025). Calibration and performance of a Raman-based device for non-invasive glucose monitoring in type 2 diabetes. {{Scientific Reports, 15}}, Article 10226. ",
  "https://doi.org/10.1038/s41598-025-95334-x"
 ],
 [
  "Todaro, B., Begarani, F., Sartori, F., & Luin, S. (2022). Is Raman the best strategy towards the development of non-invasive continuous glucose monitoring devices for diabetes management? {{Frontiers in Chemistry, 10}}, 994272. ",
  "https://doi.org/10.3389/fchem.2022.994272"
 ],
 [
  "Kang, J. W., Park, Y. S., Chang, H., Lee, W., Singh, S. P., Choi, W., Galindo, L. H., Dasari, R. R., Nam, S. H., Park, J., & So, P. T. C. (2020). Direct observation of glucose fingerprint using in vivo Raman spectroscopy. {{Science Advances, 6}}(4), eaay5206. ",
  "https://doi.org/10.1126/sciadv.aay5206"
 ],
 [
  "Zhang, Y., Zhang, L., Wang, L., Shao, S., Tao, B., Hu, C., Chen, Y., Shen, Y., Zhang, X., Pan, S., Cao, H., Sun, M., Shi, J., Jiang, C., Chen, M., Zhou, L., Ning, G., Chen, C., & Wang, W. (2025). Subcutaneous depth-selective spectral imaging with mμSORS enables noninvasive glucose monitoring. {{Nature Metabolism, 7}}(2), 421-433. ",
  "https://doi.org/10.1038/s42255-025-01217-w"
 ],
 [
  "Feng, X., Zhang, Y., Zhang, L., Shen, Y., Zhang, X., Xu, Y., Wang, L., Tao, B., Chen, Y., Shi, J., Chen, M., Chen, C., Zhou, L., Wu, Y., & Wang, W. (2026). Non-invasive glucose monitoring using mμSORS: A population-based validation study across diverse patient variability. {{Journal of Diabetes Science and Technology, 20}}(5), 1513-1524. ",
  "https://doi.org/10.1177/19322968261464571"
 ],
 [
  "German Center for Diabetes Research (DZD). (2025, February 12). A future without needles: Optical glucose monitoring for diabetes. DZD News. ",
  "https://www.dzd-ev.de/en/article/eine-zukunft-ohne-nadeln-optische-glukose-messung-bei-diabetes"
 ],
 [
  "Chen, M., Shen, Y., Zhu, J., Su, T., Zhang, Y., Wang, W., Chen, C., & Zhou, L. (2024). Assessment of optical attenuation and skin thickness in type 2 diabetes mellitus patients using optical coherence tomography. {{Journal of Biophotonics, 17}}(12), e202400267. ",
  "https://doi.org/10.1002/jbio.202400267"
 ],
 [
  "Gómez-Peralta, F., Luque Romero, L. G., Puppo-Moreno, A., & Riesgo, J. (2024). Performance of a non-invasive system for monitoring blood glucose levels based on near-infrared spectroscopy technology (Glucube). {{Sensors, 24}}(23), 7811. ",
  "https://doi.org/10.3390/s24237811"
 ],
 [
  "U.S. Food and Drug Administration. (2024, February 21). Do not use smartwatches or smart rings to measure blood glucose levels: FDA safety communication. ",
  "https://www.fda.gov/medical-devices/safety-communications/do-not-use-smartwatches-or-smart-rings-measure-blood-glucose-levels-fda-safety-communication"
 ],
 [
  "Kuranov, R., Prough, D., Sapozhnikova, V., Cicenaite, I., & Esenaliev, R. (2005). In vivo application of 2-D lateral scanning mode optical coherence tomography for glucose sensing. {{Proceedings of SPIE, 6007}}, 60070K. ",
  "https://doi.org/10.1117/12.630840"
 ],
 [
  "Xi, H., & Gong, Y. (2025). Optical non-invasive glucose monitoring using aqueous humor: A review. {{Sensors, 25}}(13), 4236. ",
  "https://doi.org/10.3390/s25134236"
 ],
 [
  "Auburn University Radiation Safety Office. (2007). {{Laser safety manual}}. Auburn University.",
  null
 ],
 [
  "Harman-Boehm, I., Gal, A., Raykhman, A. M., Zahn, J. D., Naidis, E., & Mayzel, Y. (2009). Noninvasive glucose monitoring: A novel approach. {{Journal of Diabetes Science and Technology, 3}}(2), 253-260. ",
  "https://doi.org/10.1177/193229680900300205"
 ],
 [
  "Bahartan, K., Horman, K., Gal, A., Drexler, A., Mayzel, Y., & Lin, T. (2017). Assessing the performance of a noninvasive glucose monitor in people with type 2 diabetes with different demographic profiles. {{Journal of Diabetes Research, 2017}}, Article 4393497. ",
  "https://doi.org/10.1155/2017/4393497"
 ],
 [
  "Wentholt, I. M. E., Hoekstra, J. B. L., Zwart, A., & DeVries, J. H. (2005). Pendra goes Dutch: Lessons for the CE mark in Europe. {{Diabetologia, 48}}(6), 1055-1058. ",
  "https://doi.org/10.1007/s00125-005-1754-y"
 ],
 [
  "Pfützner, A., Caduff, A., Larbig, M., Schrepfer, T., & Forst, T. (2004). Impact of posture and fixation technique on impedance spectroscopy used for continuous and noninvasive glucose monitoring. {{Diabetes Technology & Therapeutics, 6}}(4), 435-441. ",
  "https://doi.org/10.1089/1520915041705839"
 ],
 [
  "Caduff, A., Talary, M. S., Mueller, M., Dewarrat, F., Klisic, J., Donath, M., Heinemann, L., & Stahel, W. A. (2009). Non-invasive glucose monitoring in patients with Type 1 diabetes: A Multisensor system combining sensors for dielectric and optical characterisation of skin. {{Biosensors and Bioelectronics, 24}}(9), 2778-2784. ",
  "https://doi.org/10.1016/j.bios.2009.02.001"
 ],
 [
  "Mueller, M., Talary, M. S., Falco, L., De Feo, O., Stahel, W. A., & Caduff, A. (2011). Data processing for noninvasive continuous glucose monitoring with a multisensor device. {{Journal of Diabetes Science and Technology, 5}}(3), 694-702. ",
  "https://doi.org/10.1177/193229681100500324"
 ],
 [
  "Caduff, A., Zanon, M., Mueller, M., Zakharov, P., Feldman, Y., De Feo, O., Donath, M., Stahel, W. A., & Talary, M. S. (2015). The effect of a global, subject, and device-specific model on a noninvasive glucose monitoring multisensor system. {{Journal of Diabetes Science and Technology, 9}}(4), 865-872. ",
  "https://doi.org/10.1177/1932296815579459"
 ],
 [
  "Zanon, M., Mueller, M., Zakharov, P., Talary, M. S., Donath, M., Stahel, W. A., & Caduff, A. (2018). First experiences with a wearable multisensor device in a noninvasive continuous glucose monitoring study at home, part II: The investigators' view. {{Journal of Diabetes Science and Technology, 12}}(3), 554-561. ",
  "https://doi.org/10.1177/1932296817740591"
 ],
 [
  "Huber, D., Talary, M., Dewarrat, F., & Caduff, A. (2007). The compensation of perturbing temperature fluctuation in glucose monitoring technologies based on impedance spectroscopy. {{Medical & Biological Engineering & Computing, 45}}(9), 863-876. ",
  "https://doi.org/10.1007/s11517-007-0229-3"
 ],
 [
  "McAuley, S. A., Dang, T. T., Horsburgh, J. C., Bansal, A., Ward, G. M., Aroyan, S., Jenkins, A. J., MacIsaac, R. J., Shah, R. V., & O'Neal, D. N. (2016). Feasibility of an orthogonal redundant sensor incorporating optical plus redundant electrochemical glucose sensing. {{Journal of Diabetes Science and Technology, 10}}(3), 679-688. ",
  "https://doi.org/10.1177/1932296816629982"
 ],
 [
  "Sharifi, A., Varsavsky, A., Ulloa, J., Horsburgh, J. C., McAuley, S. A., Krishnamurthy, B., Jenkins, A. J., Colman, P. G., Ward, G. M., MacIsaac, R. J., Shah, R., & O'Neal, D. N. (2016). Redundancy in glucose sensing: Enhanced accuracy and reliability of an electrochemical redundant sensor for continuous glucose monitoring. {{Journal of Diabetes Science and Technology, 10}}(3), 669-678. ",
  "https://doi.org/10.1177/1932296815612096"
 ],
 [
  "Kirchsteiger, H., Heinemann, L., Freckmann, G., Lodwig, V., Schmelzeisen-Redeker, G., Schoemaker, M., & Del Re, L. (2015). Performance comparison of CGM systems: MARD values are not always a reliable indicator of CGM system accuracy. {{Journal of Diabetes Science and Technology, 9}}(5), 1030-1040. ",
  "https://doi.org/10.1177/1932296815586013"
 ],
 [
  "Blanc, R., Blandin, P., Coutard, J.-G., Jourde, K., Marie, H., & Benhamou, P.-Y. (2026). How to demonstrate the glucose specificity of a non-invasive CGM: A case study of the SKAMo-2 clinical trial and Neogly [Preprint]. medRxiv. ",
  "https://doi.org/10.64898/2026.08.17.26360581"
 ],
 [
  "Know Labs, Inc. (2024). Noninvasive blood glucose measurement using RF spectroscopy and a LightGBM AI model. Research and Validation. ",
  "https://www.knowlabs.co/research-and-validation"
 ],
 [
  "Karim, F., Anderson, J. H., Currie, K., Bui, C., Klyve, D., & Somers, V. K. (2024). A glycemic status classification model using a radiofrequency noninvasive blood glucose monitor. {{Diabetes Technology & Therapeutics, 26}}(12), 979-983. ",
  "https://doi.org/10.1089/dia.2024.0170"
 ],
 [
  "Handy, C., Chaudhry, M. S., Qureshi, M. R. A., Love, B., Shillingford, J., Plum-Mörschel, L., & Zijlstra, E. (2024). Noninvasive continuous glucose monitoring with a novel wearable dial resonating sensor: A clinical proof-of-concept study. {{Journal of Diabetes Science and Technology, 18}}(6), 1408-1415. ",
  "https://doi.org/10.1177/19322968231170242"
 ],
 [
  "Qureshi, M. R. A., Bain, S. C., Luzio, S., Handy, C., Fowles, D. J., Love, B., Wareham, K., Barlow, L., Dunseath, G. J., Crane, J., Masso, I. C., Ryan, J. A. M., & Chaudhry, M. S. (2025). Using artificial intelligence to improve the accuracy of a wrist-worn, noninvasive glucose monitor: A pilot study. {{Journal of Diabetes Science and Technology, 19}}(6), 1546-1553. ",
  "https://doi.org/10.1177/19322968241252819"
 ],
 [
  "The Diabetes Times. (2026, 10 de marzo). World's first non-invasive glucose monitoring device hits 75 per cent accuracy in first real-world trial. ",
  "https://diabetestimes.co.uk/worlds-first-glucose-monitoring-device-hits-75-per-cent-accuracy-in-first-real-word-trial/"
 ],
 [
  "Malmberg, C. G., & Maryott, A. A. (1956). Dielectric constant of water from 0° to 100° C. {{Journal of Research of the National Bureau of Standards, 56}}(1), 1-8.",
  null
 ],
 [
  "Prlić, I., Šiško, J., Varnai, V. M., Pavelić, L., Macan, J., Kobešćak, S., Hajdinjak, M., Jurdana, M., Cerovac, Z., Zauner, B., Surić Mihić, M., & Cvijetić Avdagić, S. (2022). Wi-Fi technology and human health impact: A brief review of current knowledge. {{Archives of Industrial Hygiene and Toxicology, 73}}(2), 94-106. ",
  "https://doi.org/10.2478/aiht-2022-73-3402"
 ],
 [
  "Tsalikian, E., Kollman, C., Mauras, N., Weinzimer, S., Buckingham, B., Xing, D., Beck, R., Ruedy, K., Tamborlane, W., Fiallo-Scharer, R., & DirecNet Study Group. (2004b). GlucoWatch G2 Biographer alarm reliability during hypoglycemia in children. {{Diabetes Technology & Therapeutics, 6}}(5), 559-566. ",
  "https://doi.org/10.1089/dia.2004.6.559"
 ],
 [
  "Chase, H. P., Beck, R., Tamborlane, W., Buckingham, B., Mauras, N., Tsalikian, E., Wysocki, T., Weinzimer, S., Kollman, C., Ruedy, K., & Xing, D. (2005). A randomized multicenter trial comparing the GlucoWatch Biographer with standard glucose monitoring in children with type 1 diabetes. {{Diabetes Care, 28}}(5), 1101-1106. ",
  "https://doi.org/10.2337/diacare.28.5.1101"
 ],
 [
  "Santélog. (2018, 12 de abril). Nemaura successfully completes clinical studies for sugarBEAT FDA De Novo 510(k) [Comunicado de Nemaura Medical, Inc.]. ",
  "https://www.santelog.com/actualites-sante-nasdaq/nemaura-successfully-completes-clinical-studies-sugarbeatr-fda-de-novo-510k"
 ],
 [
  "Nemaura Medical Inc. (2024, 3 de enero). Important update on listing status and strategic direction [Comunicado de prensa, Exhibit 99.1]. U.S. Securities and Exchange Commission.",
  null
 ],
 [
  "Zhu, W., Yu, H., Li, W., Li, X., Zheng, H., Li, C., Zhang, X., Jin, C., Wang, M., Hou, J., Liu, Y., Ma, Y., Zhou, Z., Deng, M., Guo, P., Li, M., Song, Z., Pu, Z., & Li, D. (2025). pH calibration allows accurate glucose detection in interstitial fluid via reverse iontophoresis. {{Nature Communications, 16}}, Article 10413. ",
  "https://doi.org/10.1038/s41467-025-65453-0"
 ],
 [
  "Zafar, H., Channa, A., Jeoti, V., & Stojanović, G. M. (2022). Comprehensive review on wearable sweat-glucose sensors for continuous glucose monitoring. {{Sensors, 22}}(2), Article 638. ",
  "https://doi.org/10.3390/s22020638"
 ],
 [
  "Mascarenhas, P., Fatela, B., & Barahona, I. (2014). Effect of diabetes mellitus type 2 on salivary glucose: A systematic review and meta-analysis of observational studies. {{PLoS ONE, 9}}(7), Article e101706. ",
  "https://doi.org/10.1371/journal.pone.0101706"
 ],
 [
  "Stevens, S., Garner, C., Wei, C., Greenwood, R., Hamilton-Shield, J., de Lacy Costello, B., Ratcliffe, N., & Probert, C. (2013). A study of volatile compounds in the breath of children with type 1 diabetes [Preprint]. arXiv:1303.4210.",
  null
 ],
 [
  "Hitachi, Ltd. (2004, 23 de febrero). Hitachi develops non-invasive blood sugar monitor [Comunicado de prensa]. ",
  "https://www.hitachi.com/New/cnews/040223.html"
 ],
 [
  "Shang, T., Zhang, J. Y., Thomas, A., Arnold, M. A., Vetter, B. N., Heinemann, L., & Klonoff, D. C. (2022). Products for monitoring glucose levels in the human body with noninvasive optical, noninvasive fluid sampling, or minimally invasive technologies. {{Journal of Diabetes Science and Technology, 16}}(1), 168-214. ",
  "https://doi.org/10.1177/19322968211007212"
 ],
 [
  "Amuedo, S., Macías, M. E., Fornés, J. M., Arteaga, A. M., Barrau, J. R., Bellido, V., Viñau, F. L., Pichardo, L. M. H., Moreno, A. S., Moreno, A. P., & López, A. P. (2026). Real-world evaluation of a near-infrared spectroscopy-based noninvasive glucose monitoring device in adults with type 2 diabetes. {{Journal of Diabetes Science and Technology}}. ",
  "https://doi.org/10.1177/19322968261496268"
 ],
 [
  "Garg, S. K., Kipnes, M., Castorino, K., Bailey, T. S., Akturk, H. K., Welsh, J. B., Christiansen, M. P., Balo, A. K., Brown, S. A., Reid, J. L., & Beck, S. E. (2022). Accuracy and safety of Dexcom G7 continuous glucose monitoring in adults with diabetes. {{Diabetes Technology & Therapeutics, 24}}(6), 373-380. ",
  "https://doi.org/10.1089/dia.2022.0011"
 ],
 [
  "Prince, N., Ramsay, T., Shorr, R., Rabasa-Lhoret, R., & Sun, C. J. (2026). Systematic review of continuous glucose monitor accuracy in the hypoglycemia range for non-critical care ward hospitalized people living with diabetes. {{Journal of Diabetes Science and Technology, 20}}(4), 1389-1395. ",
  "https://doi.org/10.1177/19322968251412482"
 ],
 [
  "Eichenlaub, M., Waldenmaier, D., Wehrstedt, S., Pleus, S., Link, M., Jendrike, N., Öter, S., Haug, C., Schinz, M., Braunack-Mayer, V., Schneider, R., Brandt, D., & Freckmann, G. (2026). Performance of three continuous glucose monitoring systems in adults with type 1 diabetes. {{Journal of Diabetes Science and Technology, 20}}(4), 1131-1140. ",
  "https://doi.org/10.1177/19322968251315459"
 ],
 [
  "Pleus, S., Eichenlaub, M., Waldenmaier, D., & Freckmann, G. (2024). A critical discussion of alert evaluations in the context of continuous glucose monitoring system performance. {{Journal of Diabetes Science and Technology, 18}}(4), 847-856. ",
  "https://doi.org/10.1177/19322968241236504"
 ],
 [
  "Tsalikian, E., Beck, R. W., Tamborlane, W. V., Chase, H. P., Buckingham, B. A., Weinzimer, S. A., Mauras, N., Ruedy, K. J., Kollman, C., Xing, D., & DirecNet Study Group. (2004a). Accuracy of the GlucoWatch G2 Biographer and the Continuous Glucose Monitoring System during hypoglycemia: Experience of the Diabetes Research in Children Network (DirecNet). {{Diabetes Care, 27}}(3), 722-726. ",
  "https://doi.org/10.2337/diacare.27.3.722"
 ],
 [
  "Buckingham, B., Block, J., Burdick, J., Kalajian, A., Kollman, C., Choy, M., Wilson, D. M., Chase, P., & Diabetes Research in Children Network. (2005). Response to nocturnal alarms using a real-time glucose sensor. {{Diabetes Technology & Therapeutics, 7}}(3), 440-447. ",
  "https://doi.org/10.1089/dia.2005.7.440"
 ],
 [
  "Eichenlaub, M., Öter, S., Waldenmaier, D., Kulzer, B., Heinemann, L., Ziegler, R., Schnell, O., Glatzer, T., & Freckmann, G. (2024). Characteristics of nocturnal hypoglycaemic events and their impact on glycaemia. {{Journal of Diabetes Science and Technology, 18}}(5), 1035-1043. ",
  "https://doi.org/10.1177/19322968241267765"
 ],
 [
  "Mitter, M., Theodorou, D., Ruch, B., Glatzer, T., & Zivkovic, J. (2025). Nocturnal hypoglycemia: Characterization with continuous glucose monitoring in a real-world setting. {{Diabetes Technology & Therapeutics, 27}}(11), 890-898. ",
  "https://doi.org/10.1177/15209156251369884"
 ],
 [
  "Yu, X., Fan, M., Zhao, X., Ding, Y., Liu, X., Yang, S., & Zhang, X. (2023). Prevalence of impaired awareness of hypoglycaemia in people with diabetes mellitus: A systematic review and meta-analysis from 21 countries and regions. {{Diabetic Medicine, 40}}(9), e15129. ",
  "https://doi.org/10.1111/dme.15129"
 ],
 [
  "Blaabjerg, L., Remvig, L. S., Nielsen, S. S., Duun-Henriksen, J., Juhl, C., Højlund, K., Thorsteinsson, B., & Beck-Nielsen, H. (2019). Prevention of severe hypoglycemia by use of the electroencephalography-based alarm device, hyposafe SubQ [Meeting abstract]. {{Journal of Diabetes Science and Technology}} (2018 Diabetes Technology Meeting Abstracts). ",
  "https://pmc.ncbi.nlm.nih.gov/articles/PMC6399788/"
 ],
 [
  "Snogdal, L. S., Folkestad, L., Elsborg, R., Remvig, L. S., Beck-Nielsen, H., Thorsteinsson, B., Jennum, P., Gjerstad, M., & Juhl, C. B. (2012). Detection of hypoglycemia associated EEG changes during sleep in type 1 diabetes mellitus. {{Diabetes Research and Clinical Practice, 98}}(1), 91-97. ",
  "https://doi.org/10.1016/j.diabres.2012.04.014"
 ],
 [
  "Juhl, C. B., Højlund, K., Elsborg, R., Poulsen, M. K., Selmar, P. E., Holst, J. J., Christiansen, C., & Beck-Nielsen, H. (2010). Automated detection of hypoglycemia-induced EEG changes recorded by subcutaneous electrodes in subjects with type 1 diabetes: The brain as a biosensor. {{Diabetes Research and Clinical Practice, 88}}(1), 22-28. ",
  "https://doi.org/10.1016/j.diabres.2010.01.007"
 ],
 [
  "Hansen, G. L., Foli-Andersen, P., Fredheim, S., Juhl, C., Remvig, L. S., Rose, M. H., Rosenzweig, I., Beniczky, S., Olsen, B., Pilgaard, K., & Johannesen, J. (2016). Hypoglycemia-associated EEG changes in prepubertal children with type 1 diabetes. {{Journal of Diabetes Science and Technology, 10}}(6), 1222-1229. ",
  "https://doi.org/10.1177/1932296816634357"
 ],
 [
  "Larsen, A., Højlund, K., Poulsen, M. K., Madsen, R. E., & Juhl, C. B. (2013). Hypoglycemia-associated electroencephalogram and electrocardiogram changes appear simultaneously. {{Journal of Diabetes Science and Technology, 7}}(1), 93-99. ",
  "https://doi.org/10.1177/193229681300700111"
 ],
 [
  "Schechter, A., Eyal, O., Zuckerman-Levin, N., Amihai-Ben-Yaacov, V., Weintrob, N., & Shehadeh, N. (2012). A prototype of a new noninvasive device to detect nocturnal hypoglycemia in adolescents with type 1 diabetes: A pilot study. {{Diabetes Technology & Therapeutics, 14}}(8), 683-689. ",
  "https://doi.org/10.1089/dia.2012.0002"
 ],
 [
  "Lehmann, V., Föll, S., Maritsch, M., van Weenen, E., Kraus, M., Lagger, S., Odermatt, K., Albrecht, C., Fleisch, E., Zueger, T., Wortmann, F., & Stettler, C. (2023). Noninvasive hypoglycemia detection in people with diabetes using smartwatch data. {{Diabetes Care, 46}}(5), 993-997. ",
  "https://doi.org/10.2337/dc22-2290"
 ],
 [
  "Mohamed, Y. M., Mancera, J., Brandenberg, A., Fischli, S., & Havranek, M. M. (2025). Personalized machine learning models for noninvasive hypoglycemia detection in people with type 1 diabetes using a smartwatch: Insights into feature importance during waking and sleeping times. {{PLOS ONE, 20}}(6), e0325956. ",
  "https://doi.org/10.1371/journal.pone.0325956"
 ],
 [
  "Mendez, C., Kaykayoglu, C. A., Bähler, T., Künzler, J., Lizoain, A., Rothenbühler, M., Schmidt, M. H., Laimer, M., & Witthauer, L. (2026). Toward detection of nocturnal hypoglycemia in people with diabetes using consumer-grade smartwatches and a machine learning approach. {{Journal of Diabetes Science and Technology, 20}}(4), 1266-1275. ",
  "https://doi.org/10.1177/19322968251319800"
 ],
 [
  "Aboukhalil, A., Nielsen, L., Saeed, M., Mark, R. G., & Clifford, G. D. (2008). Reducing false alarm rates for critical arrhythmias using the arterial blood pressure waveform. {{Journal of Biomedical Informatics, 41}}(3), 442-451. ",
  "https://doi.org/10.1016/j.jbi.2008.03.003"
 ],
 [
  "Bitan, Y., & O'Connor, M. F. (2012). Correlating data from different sensors to increase the positive predictive value of alarms: An empiric assessment. {{F1000Research, 1}}, 45. ",
  "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3752621/"
 ],
 [
  "Basu, A., Dube, S., Slama, M., Errazuriz, I., Amezcua, J. C., Kudva, Y. C., Peyser, T., Carter, R. E., Cobelli, C., & Basu, R. (2013). Time lag of glucose from intravascular to interstitial compartment in humans. {{Diabetes, 62}}(12), 4083-4087. ",
  "https://doi.org/10.2337/db13-1132"
 ],
 [
  "Basu, A., Dube, S., Veettil, S., Slama, M., Kudva, Y. C., Peyser, T., Carter, R. E., Cobelli, C., & Basu, R. (2015). Time lag of glucose from intravascular to interstitial compartment in type 1 diabetes. {{Journal of Diabetes Science and Technology, 9}}(1), 63-68. ",
  "https://doi.org/10.1177/1932296814554797"
 ],
 [
  "Ahmad, K., Rule, P., Bañez, B., Hale, D., & Van Antwerp, B. (2025). Dermal glucose sensing has a shorter time lag relative to blood glucose: Implications for hypoglycemia detection and time in range. {{Journal of Diabetes Science and Technology}}. ",
  "https://doi.org/10.1177/19322968251389630"
 ],
 [
  "Khalil, E., Kretsos, K., & Kasting, G. B. (2006). Glucose partition coefficient and diffusivity in the lower skin layers. {{Pharmaceutical Research, 23}}(6), 1227-1234. ",
  "https://doi.org/10.1007/s11095-006-0141-9"
 ],
 [
  "Sandby-Møller, J., Poulsen, T., & Wulf, H. C. (2003). Epidermal thickness at different body sites: Relationship to age, gender, pigmentation, blood content, skin type and smoking habits. {{Acta Dermato-Venereologica, 83}}(6), 410-413. ",
  "https://doi.org/10.1080/00015550310015419"
 ],
 [
  "U.S. Food and Drug Administration. (s. f.). 21 CFR § 862.1355 Integrated continuous glucose monitoring system. Code of Federal Regulations, Title 21. Legal Information Institute, Cornell Law School. ",
  "https://www.law.cornell.edu/cfr/text/21/862.1355"
 ],
 [
  "Sharif-Nia, H., Mokhtari, H., Osborne, J. W., Shafaei, S., & Soltanzade, M. (2025). Evaluation of the accuracy, precision, and agreement of a glucometer compared to the standard laboratory test in diabetic and non-diabetic patients. {{Scientific Reports}}. ",
  "https://doi.org/10.1038/s41598-025-28009-2"
 ],
 [
  "Dexcom, Inc. (2025, April 10). Dexcom G7 15 Day receives FDA clearance: The longest lasting wearable and most accurate CGM system [Press release]. ",
  "https://investors.dexcom.com/news/news-details/2025/Dexcom-G7-15-Day-Receives-FDA-Clearance-the-Longest-Lasting-Wearable-and-Most-Accurate-CGM-System/default.aspx"
 ],
 [
  "Innolitics. (2025). Dexcom G7 15 Day Continuous Glucose Monitoring System (K243214) [FDA 510(k) summary mirror]. ",
  "https://fda.innolitics.com/device/K243214"
 ],
 [
  "Abbott. (2022, June 5). Late-breaking data demonstrate Abbott's FreeStyle Libre 3 system is most accurate 14-day continuous glucose monitor [Press release]. ",
  "https://abbott.mediaroom.com/2022-06-05-Late-Breaking-Data-Demonstrate-Abbotts-FreeStyle-Libre-R-3-System-is-Most-Accurate-14-Day-Continuous-Glucose-Monitor"
 ],
 [
  "Innolitics. (2024). Lingo Glucose System (K233655) [FDA 510(k) summary mirror]. ",
  "https://fda.innolitics.com/device/K233655"
 ],
 [
  "Abbott. (s. f.). Lingo Glucose System. ",
  "https://www.hellolingo.com/"
 ],
 [
  "Dexcom, Inc. (s. f.). Stelo glucose biosensor. ",
  "https://www.stelo.com/"
 ],
 [
  "Bailey, T. S., Liljenquist, D. R., Denham, D. S., Brazg, R. L., Ioacara, S., Masciotti, J., Ghosh-Dastidar, S., Tweden, K. S., & Kaufman, F. R. (2025). Evaluation of accuracy and safety of the 365-day implantable Eversense continuous glucose monitoring system: The ENHANCE study. {{Diabetes Technology & Therapeutics, 27}}(5), 407-411. ",
  "https://doi.org/10.1089/dia.2024.0592"
 ],
 [
  "Dexcom, Inc. (2026, February 12). Dexcom reports fourth quarter and fiscal year 2025 financial results [Press release]. ",
  "https://investors.dexcom.com/news/news-details/2026/Dexcom-Reports-Fourth-Quarter-and-Fiscal-Year-2025-Financial-Results/default.aspx"
 ],
 [
  "Abbott. (2026, January 22). Abbott reports fourth-quarter and full-year 2025 results; issues 2026 financial outlook [Press release]. ",
  "https://abbott.mediaroom.com/2026-01-22-Abbott-Reports-Fourth-Quarter-and-Full-Year-2025-Results-Issues-2026-Financial-Outlook"
 ],
 [
  "U.S. Food and Drug Administration. (2025). Evaluation of automatic class III designation for Biolinq Shine Autonomous Time-in-Range Microsensor: Decision summary (DEN240080). ",
  "https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN240080.pdf"
 ],
 [
  "USBC, Inc. (formerly Know Labs, Inc.). (2025). Form 10-K for the fiscal year ended September 30, 2025. U.S. Securities and Exchange Commission. ",
  "https://www.sec.gov/Archives/edgar/data/1074828/000165495425014138/usbc_10k.htm"
 ],
 [
  "Drug Delivery Business. (2023, November 13). Glucotrack transitions strategic focus to implantable CGM. ",
  "https://www.drugdeliverybusiness.com/glucotrack-transitions-strategic-focus-implantable-cgm/"
 ],
 [
  "MedTech Dive. (2025, July 8). Implantable CGM startup Glucotrack shares first patient data. ",
  "https://www.medtechdive.com/news/implantable-cgm-glucotrack-early-data/752490/"
 ],
 [
  "Healio. (2021, August 3). Noninvasive glucose monitoring may change future of diabetes management [News article on Shang, T., et al. (2021), Journal of Diabetes Science and Technology, https://doi.org/10.1177/19322968211007212]. ",
  "https://www.healio.com/news/endocrinology/20210802/noninvasive-glucose-monitoring-may-change-future-of-diabetes-management"
 ],
 [
  "Leung, H. M. C., Forlenza, G. P., Prioleau, T. O., & Zhou, X. (2023). Noninvasive glucose sensing in vivo. {{Sensors, 23}}(16), 7057. ",
  "https://doi.org/10.3390/s23167057"
 ],
 [
  "Lipson, J., Bernhardt, J., Block, U., Freeman, W. R., Hofmeister, R., Hristakeva, M., Lenosky, T., McNamara, R., Petrasek, D., Veltkamp, D., & Waydo, S. (2009). Requirements for calibration in noninvasive glucose monitoring by Raman spectroscopy. {{Journal of Diabetes Science and Technology, 3}}(2), 233-241. ",
  "https://doi.org/10.1177/193229680900300203"
 ],
 [
  "PMOptics. (s. f.). Portable Raman spectrometer GL-PRS-785. ",
  "https://www.pmoptics.com/Raman%20spectrometer%20GL-PRS-785.html"
 ],
 [
  "Facchinetti, A., Sparacino, G., & Cobelli, C. (2011). Online denoising method to handle intraindividual variability of signal-to-noise ratio in continuous glucose monitoring. {{IEEE Transactions on Biomedical Engineering, 58}}(9), 2664-2671. ",
  "https://doi.org/10.1109/TBME.2011.2161083"
 ],
 [
  "Facchinetti, A., Del Favero, S., Sparacino, G., & Cobelli, C. (2013). An online failure detection method of the glucose sensor-insulin pump system: Improved overnight safety of type-1 diabetic subjects. {{IEEE Transactions on Biomedical Engineering, 60}}(2), 406-416. ",
  "https://doi.org/10.1109/TBME.2012.2227256"
 ],
 [
  "Palerm, C. C., Willis, J. P., Desemone, J., & Bequette, B. W. (2005). Hypoglycemia prediction and detection using optimal estimation. {{Diabetes Technology & Therapeutics, 7}}(1), 3-14. ",
  "https://doi.org/10.1089/dia.2005.7.3"
 ],
 [
  "Cameron, F., Wilson, D. M., Buckingham, B. A., Arzumanyan, H., Clinton, P., Chase, H. P., Lum, J., Maahs, D. M., Calhoun, P. M., & Bequette, B. W. (2012). Inpatient studies of a Kalman-filter-based predictive pump shutoff algorithm. {{Journal of Diabetes Science and Technology, 6}}(5), 1142-1147. ",
  "https://doi.org/10.1177/193229681200600519"
 ],
 [
  "Turksoy, K., Samadi, S., Feng, J., Littlejohn, E., Quinn, L., & Cinar, A. (2016). Meal-detection in patients with type 1 diabetes: A new module for the multivariable adaptive artificial pancreas control system. {{IEEE Journal of Biomedical and Health Informatics, 20}}(1), 47-54. ",
  "https://doi.org/10.1109/JBHI.2015.2446413"
 ],
 [
  "Al Ahdab, M., Benam, K. D., Khoshamadi, H., Fougner, A. L., & Gros, S. (2023). Sensor fusion for glucose monitoring systems. {{IFAC-PapersOnLine, 56}}(2), 11527-11532. ",
  "https://doi.org/10.1016/j.ifacol.2023.10.444"
 ],
 [
  "Wikipedia contributors. (s. f.). Covariance intersection. Wikipedia. ",
  "https://en.wikipedia.org/wiki/Covariance_intersection"
 ],
 [
  "Ahmed, A., Aziz, S., Abd-alrazaq, A., Farooq, F., Househ, M., & Sheikh, J. (2023). The effectiveness of wearable devices using artificial intelligence for blood glucose level forecasting or prediction: Systematic review. {{Journal of Medical Internet Research, 25}}, e40259. ",
  "https://doi.org/10.2196/40259"
 ],
 [
  "Ahmed, S. S., & Noury, N. (2026). Non-invasive blood glucose monitoring using machine learning and optical approaches: A systematic literature review and a proposed framework for reproducible and clinically reliable research. {{Sensors, 26}}(20), 6572. ",
  "https://doi.org/10.3390/s26206572"
 ],
 [
  "Ramesh, S., Neufeld, M., Küttner, M., Röddiger, T., & Beigl, M. (2026). Reassessing the feasibility of PPG-based non-invasive blood glucose level estimation (arXiv:2608.01820) [Preprint]. arXiv. ",
  "https://arxiv.org/abs/2608.01820"
 ]
];

module.exports = (h) => {
  const { P, H2, H3, B, figura, tabla, recuadro, codigo, link, rich } = h;
  const A = CALC.a_difusion;
  const Bf = CALC.b_fusion;
  const C = CALC.c_ruido;
  const D = CALC.d_alarmas;
  const E = CALC.e_limites;
  const F = CALC.f_rango;
  const canal = (k) => D.canales[k];

  const bonito = (n) => n
    .replace("Via optica sigma 13 (error lento)", "óptica σ 13 con error lento")
    .replace("Via optica sigma 18 (error lento)", "óptica σ 18 con error lento")
    .replace("Via optica sigma 25 (error lento)", "óptica σ 25 con error lento")
    .replace("Via optica sigma 13", "óptica σ 13 con ruido blanco")
    .replace("Via optica sigma 18", "óptica σ 18 con ruido blanco")
    .replace("EEG en el oido (hipotetico)", "EEG del oído")
    .replace("EEG subcutaneo", "EEG subcutáneo")
    .replace("Reloj inteligente", "reloj")
    .replace("(dependencia 0,3)", "con dependencia 0,3")
    .replace(/ Y /g, " Y ").replace(/^2 de 3: /, "2 de 3: ");
  const filaCombo = (x) => [bonito(x.nombre), pc(x.se), f(x.fa_semana, 2), pc(x.vpp), x.cumple_RB ? "cumple" : RJ("no cumple")];
  const buscarCombo = (ver, nombre) => {
    const r = D.versiones[ver].find((x) => x.nombre === nombre);
    if (!r) throw new Error("no esta " + nombre);
    return r;
  };

  // ------------------------------------------------------------------ referencias
  const referencias = [
    ...REFS_APA
      .slice()
      .sort((a, b) => a[0].replace(/[{}]/g, "").localeCompare(b[0].replace(/[{}]/g, ""), "es"))
      .map(([txt, url]) => {
        const para = new Paragraph({
          spacing: { after: h.refAfter || 100, line: h.refLine || 270 },
          indent: { left: 567, hanging: 567 },
          children: [...rich(txt, { size: h.refSize || 20 }), ...(url ? [link(url, url, { size: h.refSize || 20 })] : [])],
        });
        para.claveOrden = txt.replace(/[{}]/g, "");
        para.urlOrden = url || "";
        return para;
      }),
  ];

  // ------------------------------------------------------------------ metodologia
  const metodologia = [
    H2("2.1 Metodología del análisis de viabilidad"),
    P("El análisis de viabilidad es lo que en inglés se llama «dry lab», o laboratorio seco: usa solo papel, literatura y cálculo. El equipo no construye aparatos ni mide personas. Con ese método se puede comprobar si una idea choca con un límite físico, si sus cifras publicadas alcanzan una meta cuando se combinan con una fórmula, y cuáles supuestos pesan más en el resultado."),
    H3("Lo que puede demostrar y lo que no"),
    B("Puede mostrar que una idea no cabe en un límite físico, por ejemplo la profundidad que alcanza la luz en la piel."),
    B("Puede mostrar que las mejores cifras publicadas, combinadas con una fórmula, no llegan a una meta fijada de antemano."),
    B("Puede mostrar qué supuesto decide el resultado, por ejemplo cuánto se parecen los errores de dos sensores."),
    B(RJ("No puede demostrar que un aparato funcione sobre la piel.") + " Tampoco mide el error real de un dispositivo ni reemplaza un estudio clínico."),
    B(RJ("Una simulación con datos sintéticos verifica un cálculo, no un cuerpo.") + " El simulador del repositorio genera los datos con el mismo modelo que supone el estimador (Ríos Elgueta, 2026b)."),
    H3("Los pasos"),
    B("**Paso 1. Fuentes y su jerarquía.** La base reúne 196 hallazgos con fuente, en cuatro frentes: ópticas, electromagnéticas y multisensor, hipoglucemia y alarmas, y mercado, normas y fracasos. De mayor a menor peso: normas y reguladores, artículos revisados por pares en personas, revisiones, preprints, el libro de un experto (Smith, 2023), y datos de empresas o de prensa. Cuando una cifra viene de una empresa o de prensa, el texto lo dice (dato de la empresa)."),
    B("**Paso 2. Cálculos en papel con fórmulas.** Difusión de la glucosa en la piel, límites de señal, límites de exposición del láser y piso de la referencia. Cada cálculo muestra la fórmula, las entradas con su fuente y el resultado (Anexo D)."),
    B("**Paso 3. Simulación del repositorio.** Se reutiliza el simulador de retraso y el filtro de Kalman del repositorio, con 40 réplicas por escenario y semilla maestra 1, para traducir el error de un sensor en detección de hipoglucemia y falsas alarmas."),
    B("**Paso 4. Fusión.** Fusión de valores (varios sensores de glucosa) y fusión de decisiones (varias alarmas), con fórmulas bajo independencia y con dependencia moderada."),
    B("**Paso 5. Contraste con el mercado.** Se compara con los CGM actuales y con los intentos no invasivos que ya terminaron."),
    B("**Paso 6. Criterios fijados antes de ver los datos.** Las reglas de decisión se escribieron el 29 de octubre de 2026, antes de reunir los datos de mercado y de literatura. No se editan después de ver resultados. Una enmienda va en un archivo nuevo con su razón."),
    H2("2.2 Criterios de decisión"),
    P("El éxito del proyecto es superar a GlucoWatch G2, el primer monitor no invasivo aprobado por la FDA, justo en lo que lo hizo fracasar, combinando mediciones de biomarcadores distintos. Eso es necesario, pero no basta para que el artefacto tenga sentido hoy, porque los CGM actuales subieron mucho la vara. Por eso el veredicto responde dos preguntas por separado: si supera a GlucoWatch y si tiene sentido frente al mercado actual."),
    ...tabla(["Regla", "Pasa si", "Estado"], [
      ["**0. Mejor que GlucoWatch**", "Con las cifras publicadas de cada biomarcador y la fusión calculada, supera a GlucoWatch G2 en sus fallas: un valor predictivo positivo mayor que el suyo y de al menos 70 %, un retraso menor, ninguna calibración diaria con pinchazo. No queda peor en sensibilidad para hipoglucemia ni en MARD. No usa corriente de extracción que irrite la piel y sigue midiendo con sudor", "**Decidida por el equipo** (la meta). Los detalles numéricos son Propuesta"],
      ["**1. Evidencia por biomarcador**", "Para glucosa, un estudio revisado por pares en personas, con 20 participantes o más (o 1.000 pares o más), con MARD de 15 % o menos y calibración declarada. Para biomarcadores que no miden glucosa, sensibilidad y especificidad o AUROC con 20 participantes o más", "Propuesta"],
      ["**2. Fusión de valores**", "Con la correlación de errores de la literatura, o con ρ = 0,3 si no hay dato, el MARD fusionado llega a 12 % o menos para R-B y a 10 % o menos para R-C", "Propuesta"],
      ["**3. Alarma multibiomarcador**", "La combinación (AND, OR, k de n o bayesiana), con las mejores cifras publicadas y ρ = 0,3, cumple la regla 0 en falsas alarmas y en sensibilidad. Cada biomarcador sumado aporta información propia, y si su correlación con los demás pasa de 0,5 se descarta. Uno que depende de la respuesta autonómica nunca es la única vía", "Propuesta"],
      ["**4. Premisa de dos profundidades**", "La diferencia de retraso entre las dos capas es de 9 minutos o más. Entre 5 y 9 es marginal. Bajo 5 no es viable", "Propuesta"],
      ["**5. Práctica**", "Existe una versión portátil demostrada para uso nocturno, dentro de los límites de exposición del láser y sin calibración diaria con pinchazo", "Propuesta"],
      ["**6. Sentido de mercado**", "Para su rubro, ofrece algo que un CGM de venta libre no ofrece, sin perder confiabilidad de alarma, a un costo comparable", "Propuesta"],
    ], [2100, 5700, 1838]),
    P("La razón de los umbrales numéricos es juicio de diseño. La meta de 15 % de MARD es el mejor no invasivo sin calibrar por persona del documento de trabajo. La separación de 9 minutos sale de la simulación del repositorio, que funcionó con 9 minutos, falló 7 de 40 veces con 5 y 16 de 40 con 3, todo con 5 mg/dL de ruido."),
    H3("Rubros de uso"),
    ...tabla(["Rubro", "Para qué sirve", "Exigencia mínima"], [
      ["R-A. Bienestar o tendencia", "Ver si la glucosa sube o baja, sin decisiones médicas", "MARD de 20 % o menos y dirección de la tendencia correcta"],
      ["R-B. Alarma nocturna complementaria", "Avisar una hipoglucemia de noche, junto a un glucómetro o un CGM", "Sensibilidad de 85 % o más por evento bajo 70 mg/dL y valor predictivo positivo de 70 % o más"],
      ["R-C. Monitor que reemplaza al CGM", "Decidir dosis o conectarse a una bomba", "Criterios iCGM de la FDA (21 CFR 862.1355), en la práctica un MARD cercano a 10 % o menos"],
    ], [2600, 3400, 3638]),
    P("**Cómo se redacta el veredicto.** Sí o viable solo si pasan todas las reglas que aplican. Condicional si falla solo en reglas que un experimento concreto y barato podría resolver, y entonces se nombra ese experimento. No en cualquier otro caso, y se dice con todas sus letras."),
  ];

  // ------------------------------------------------------------------ resultados
  const resultados = [];
  resultados.push(H2("3.5 Límites por tecnología"));
  resultados.push(P("Las dos tablas resumen la mejor evidencia en personas de cada tecnología, con el límite físico y el límite práctico que la acompañan. La figura ordena los estudios por tamaño y por MARD. Los rombos son datos de la empresa o de autores de la empresa."));
  resultados.push(...figura("f11-evidencia.png", "Mejor evidencia por tecnología. La línea roja es la regla 1 (15 %). La franja ámbar es el rango de los CGM medido por grupos independientes (11,6 a 12 %) y la línea gris es lo que declaran las empresas (unos 8 %). Know Labs y DIROS no se grafican porque no informan participantes o MARD. En algunos puntos se corrió un poco la posición horizontal para que no se tapen.", 640));
  const filasTec = [
      ["IR medio (DiaMonTech)", "Absorción de la glucosa en el líquido intersticial de epidermis y dermis superior, en antebrazo o dedo", "MARD 19,6 y 20,7 % en 36 personas, con hasta 38 y 74 puntos de calibración por persona. Referencia mínima 66 mg/dL (Kaluza et al., 2025)", "El agua absorbe 590 a 651 cm-1 cerca de 1034 cm-1, así que la luz penetra unos 45 µm y siempre menos de 100 µm (Kottmann et al., 2016)", "Equipo de mesa del tamaño de una caja de zapatos, 4 min por lectura y 3 calibraciones invasivas el día 1 (dato de la empresa, Kang et al., 2026)", "CE solo del equipo de mesa, sin FDA. El modelo de bolsillo sigue en desarrollo (dato de la empresa, DiaMonTech AG, 2026)", RJ("No pasa: 19,6 y 20,7 % superan 15 %")],
      ["DIROS (IR medio con ventana de tiempo)", "Señal de una capa de 97,5 µm, entre 40 y 150 µm", "Solo ratones, r = 0,92, error de 34 mg/dL frente a 47 mg/dL sin la ventana, sin MARD (Uluç et al., 2024). En humanos, 5 voluntarios sin cifras (Prebeck et al., 2025)", "La ventana cae sobre la unión epidermis-dermis, que está a 74,9 µm en el antebrazo", "Láser de mesa, 1,5 min por espectro, sin potencia, tamaño ni retraso informados", "Investigación. Un preprint sin revisión por pares", RJ("No pasa: sin MARD y sin humanos válidos")],
      ["Raman (mμSORS, Liom, RSP)", "Vibración de la glucosa a 100 a 300 µm de profundidad, en palma o muñeca", "mμSORS 14,6 % con 230 personas, sin calibración personal (Zhang et al., 2025) y 14,5 % con 200 adultos y 4.768 pares (Feng et al., 2026, mismo grupo). Liom 14,5 % con 20 adultos y 5 en validación (Rothenbühler et al., 2026). RSP 25,8 % en casa (Lundsgaard-Nielsen et al., 2018) y 12,8 % con 4 h de calibración (Pors et al., 2025)", "Profundidad crítica de 250 a 300 µm. La señal de glucosa es mucho más débil que la de la piel y la fluorescencia, y ninguna fuente da la razón numérica (Todaro et al., 2022)", "mμSORS demora 8 min y es un equipo de escritorio (nota de prensa del DZD, 2025). Liom tiene MARD de 25,9 % en euglucemia frente a 12,4 % en hiperglucemia", "RSP declara más de 100 dispositivos fabricados (dato de la empresa, Kang et al., 2026). No se halló aprobación", "Pasa en cifra, con reserva: Liom validó con 5 personas"],
      ["Infrarrojo cercano (Glucube y otros)", "Absorción de sobretonos en el dedo", "MARD 20,3 % con 105 personas, financiado por la empresa, y error absoluto de 24,9 mg/dL bajo 100 mg/dL (Gómez-Peralta et al., 2024). 16,3 % con 48 adultos y 10 pares de calibración (Amuedo et al., 2026, sin vínculo declarado en las fuentes leídas)", "La señal de glucosa es menor que la variación entre espectros repetidos, cerca de 5 %, y el agua supera más de 6.000 veces la concentración de glucosa (Smith, 2023)", "Sin análisis de hipoglucemia. Calibración por persona", "Sensys e ILS gastaron más de 100 millones de dólares sin producto (Smith, 2023)", RJ("No pasa: 20,3 y 16,3 % superan 15 %")],
      ["OCT, polarimetría y fluorescencia", "Dispersión, rotación de la luz y fluorescencia en piel u ojo", "No se halló MARD humano moderno. OCT en conejos y microcerdos de 2001 a 2005 (Kuranov et al., 2005)", "Rotación de 0,0056 grados por 10 mg/dL y por mm de camino. El humor acuoso se retrasa 45 a 60 min según Smith (2023), y menos de 5 min en primates según una revisión (Xi y Gong, 2025)", "La birrefringencia de la córnea con el movimiento del ojo es el confusor principal (Smith, 2023)", "Sin producto. GlucoLight desapareció tras 2008 (Smith, 2023)", RJ("No pasa: sin datos humanos")],
      ["Radiofrecuencia y microondas (Know Labs, Afon)", "Cambio de la permitividad de los tejidos", "Know Labs: MARD de 12,7 y 14,0 % sin participantes ni referencia informados (dato de la empresa, Know Labs, 2024) y 93,37 % de clasificación correcta con 31 personas (Karim et al., 2024). Afon: ARD media de 46, 28 y 44 % sin recalibrar, con 29 hombres (Handy et al., 2024) y 10,3 % con IA, partición al azar de 20 personas (Qureshi et al., 2025)", "Profundidad de piel de campo de 3,8 mm a 10 GHz y 41,5 mm a 835 MHz (Prlić et al., 2022). El agua domina la señal y su permitividad cae 0,45 % por grado (cálculo, Malmberg y Maryott, 1956)", "Ninguna frecuencia mostró respuesta específica a la glucosa según Smith (2023)", "Know Labs ya no hace ensayos en humanos (USBC, 2025). Afon anunció 75 % de acierto entre normal y alta en una sola persona (The Diabetes Times, 2026)", RJ("No pasa: ARD de 28 a 46 % y datos sin participantes")],
      ["Bioimpedancia (Pendra, Solianis)", "Impedancia de la piel en el antebrazo", "Pendra: diferencia absoluta media de 52 % en 6 pacientes, poscomercialización (Wentholt et al., 2005). Solianis: MARD 18,0 % en la visita 1 y 27,3 % en la 2 con los mismos coeficientes (Caduff et al., 2009)", "Mezcla del efecto de la glucosa con el de la hidratación de la piel. La temperatura exige sensibilidades 3 a 50 veces mayores que las logradas (Huber et al., 2007)", "La postura del brazo cambió la microcirculación de 61,1 a 46,2 UA (Pfützner et al., 2004)", "Pendragon cerró y Solianis pasó a Biovotion en 2011 (Smith, 2023)", RJ("No pasa: 27,3 y 52 %")],
      ["Iontoforesis inversa (GlucoWatch, SugarBEAT)", "Glucosa extraída con corriente a través de la piel", "SugarBEAT: 11,92 % con 75 pacientes y 1 calibración capilar, comunicado de la empresa (Santélog, 2018). Con calibración por pH, el MARD bajó de 34,44 a 14,78 % en 21 personas (Zhu et al., 2025)", "La glucosa extraída está en rango micromolar y la de la sangre en milimolar (Poddar et al., 2008)", "Calibración con pinchazo, calentamiento de 30 a 60 min y corriente sobre la piel (Smith, 2023)", "Nemaura salió de Nasdaq en enero de 2024 y solo tiene CE (Nemaura Medical, 2024)", "Pasa en cifra, con reserva: 21 personas y calibración por pH. " + RJ("SugarBEAT no pasa: dato de empresa")],
      ["Multisensor (GlucoTrack, Biovotion)", "Ultrasonido, electromagnético y térmico en el lóbulo de la oreja. Impedancia y ópticos en el brazo", "GlucoTrack: ARD media de 22,3 % con 172 adultos con DT2 (Bahartan et al., 2017) y 29,9 % en la primera etapa (Harman-Boehm et al., 2009). Biovotion: MARD global de 21,1 % con 4 adultos (Caduff et al., 2015) y 35,4 % en casa con 20 (Zanon et al., 2018)", "Cada técnica suma su propio confusor", "Calibración individual. GlucoTrack tuvo 25,5 % de error en casa según un póster citado por Smith (2023)", "La empresa dejó lo no invasivo en 2023 (Drug Delivery Business, 2023)", RJ("No pasa: 21 a 35 %")],
      ["Lágrima, sudor, saliva y aliento", "Glucosa o acetona en fluidos o aire", "Saliva: r de 0,49 entre glucosa salival y glucemia en un metaanálisis (Mascarenhas et al., 2014). Aliento: la acetona no se correlacionó con la glucosa en 8 niños (Stevens et al., 2013)", "En sudor la glucosa es unas 100 veces menor que en sangre, con menos de 20 nL por minuto por glándula (Zafar et al., 2022)", "Verily detuvo el lente de contacto en noviembre de 2018 porque la correlación no era consistente (Smith, 2023)", "Sin producto", RJ("No pasa: sin MARD")],
  ];
  resultados.push(H3("Evidencia en personas y regla 1"));
  resultados.push(...tabla(["Tecnología", "Qué mide y dónde", "Mejor evidencia en personas", "Regla 1"],
    filasTec.map((r) => [r[0], r[1], r[2], r[6]]), [1500, 2000, 4638, 1500], { pad: 55, juntas: false }));
  resultados.push(H3("Límites y estado a 2026"));
  resultados.push(...tabla(["Tecnología", "Límite físico", "Límite práctico", "Estado a 2026"],
    filasTec.map((r) => [r[0], r[3], r[4], r[5]]), [1500, 2800, 2800, 2538], { pad: 55, juntas: false }));
  resultados.push(P("**Lo que dice el conjunto.** " + RJ("Ningún dispositivo no invasivo tiene autorización de la FDA para medir glucosa.") + " La FDA lo advirtió el 21 de febrero de 2024 y que un error puede causar hipoglucemia grave por sobredosis de insulina (FDA, 2024). Un inventario de 2021 contó 65 productos y " + RJ("ninguno no invasivo con FDA") + ", y solo cuatro con marca CE (Shang et al., 2022, citado por Healio, 2021). La tecnología con mejor cifra sin calibrar por persona es Raman, con 14,5 % y 14,6 %, y es de escritorio o de laboratorio."));
  resultados.push(P("**Las cifras de empresas.** Los datos de Know Labs, DiaMonTech, RSP, Liom, Afon y Glucube vienen de la empresa o de autores de la empresa. Los dos MARD de Know Labs no informan participantes, referencia ni sitio del cuerpo (Know Labs, 2024). Por eso la regla 1 pide revisión por pares y al menos 20 personas."));

  // ---- Limites fisicos
  resultados.push(H2("3.6 Límites físicos, calculados a mano"));
  resultados.push(H3("Difusión entre las capas de la piel"));
  resultados.push(P("La idea de las dos profundidades necesita que las dos capas tengan retrasos distintos. El retraso de una capa viene de cuánto tarda la glucosa en difundir desde el capilar hasta ella. El tiempo para cruzar un espesor L con un coeficiente de difusión D es t = L² / (2D). Las entradas son el espesor de la epidermis viable, 56,6 µm, y del estrato córneo, 18,3 µm, en antebrazo (Sandby-Møller et al., 2003), y los coeficientes de la glucosa en piel de cadáver a 32 °C: 2,64 × 10⁻⁶ cm²/s en dermis y entre 0,037 × 10⁻⁶ y 1,0 × 10⁻⁶ cm²/s en epidermis viable según el método (Khalil et al., 2006)."));
  const filasDif = A.filas_difusion.map((x, i) => [x.capa.replace(/(\d+,\d+)e-6/, "$1 × 10⁻⁶").replace(" um", " µm"), f(x.L_um, 1), ["1,0", "0,075", "0,037", "2,64"][i] + " × 10⁻⁶", f(x.t_min, 2) + " min", f(x.tau_losa_min, 2) + " min"]);
  resultados.push(...tabla(["Capa", "L (µm)", "D (cm²/s)", "t = L² / (2D)", "Control: τ = 4L² / (π² D)"], filasDif, [3300, 1200, 1900, 1500, 1738], { centrar: true }));
  resultados.push(P("El control con la constante de tiempo de una losa abierta por una cara da valores cerca de 20 % menores, y no cambia ninguna conclusión."));
  resultados.push(P("Para la separación se toma la unión epidermis-dermis, a 74,9 µm, como fuente de glucosa. El infrarrojo medio llega a unos 45 µm, dentro del estrato córneo y la epidermis viable, y la optoacústica de ventana a 97,5 µm, unos 23 µm bajo la unión, en la dermis superior. Esa diferencia es el retraso extra que tendría la capa del infrarrojo medio."));
  resultados.push(...tabla(["Coeficiente de la epidermis", "Separación con toda la epidermis (56,6 µm)", "Regla 4", "Separación hasta 45 µm", "Regla 4"],
    A.separacion.map((s) => [
      s.D.replace("epidermis viable ", "").replace("(D = ", "D = ").replace(")", "").replace("e-6", " × 10⁻⁶"),
      f(s.separacion_epidermis_completa_vs_dermis_min, 2) + " min",
      RJ(s.regla4_epidermis_completa === "marginal" ? "marginal" : "no viable"),
      f(s.separacion_45um_vs_dermis_min, 2) + " min",
      RJ("no viable"),
    ]), [2300, 2300, 1500, 2038, 1500], { centrar: true }));
  resultados.push(...figura("f10-profundidades.png", "Capas de la piel de antebrazo y profundidad que muestrea cada tecnología, con eje logarítmico. Fuentes: Sandby-Møller et al. (2003), Kottmann et al. (2016), Uluç et al. (2024), Zhang et al. (2025), Lundsgaard-Nielsen et al. (2018), Prlić et al. (2022) y Ahmad et al. (2025). El espesor de la dermis y la profundidad del CGM subcutáneo no se extrajeron de las fuentes.", 640));
  resultados.push(...recuadro("Regla 4: la premisa de dos profundidades no se sostiene", [
    "El mejor caso de separación es de " + f(A.mejor_separacion_min, 1) + " min, y solo si la glucosa difunde con el coeficiente más lento medido, en piel de cadáver. Con el coeficiente intermedio la separación es de " + f(A.separacion[1].separacion_epidermis_completa_vs_dermis_min, 1) + " min, y con el más rápido, de " + f(A.separacion[0].separacion_epidermis_completa_vs_dermis_min, 2) + " min.",
    RJ("La regla 4 pide 9 minutos o más. Ningún caso llega, y dos de tres quedan bajo 5 minutos, que es no viable."),
    "El retraso que sí es grande está entre la dermis y el subcutáneo: 0 a 2 minutos en 93 % de los sensores dérmicos (dato de la empresa Laxmi, Ahmad et al., 2025) frente a 5 a 10 minutos en el subcutáneo (Rebrin et al., 2010), con medianas de 5,3 a 6,2 minutos con trazadores (Basu et al., 2013) y de 6,8 minutos en DT1 (Basu et al., 2015). Pero ninguna técnica óptica de la lista llega al subcutáneo, porque el Raman de profundidad crítica llega a 250 a 300 µm y el mμSORS a 100 y 150 µm.",
  ], ROJO_CLARO, ROJO));
  resultados.push(P("Estos cálculos ignoran el flujo capilar, que acorta los retrasos reales. La fuente verdadera está algo más abajo que la unión, y el coeficiente viene de piel muerta a 32 °C, no de piel viva a 37 °C. La partición tejido y tampón es menor que 1 en todas las capas (Khalil et al., 2006). Aun así, el orden de magnitud no deja que el resultado llegue a 9 minutos."));

  resultados.push(H3("Señal frente a ruido y límites de detección"));
  resultados.push(P("En infrarrojo medio la señal máxima es de unos 2 mAU para 100 mg/dL y el ruido rms del instrumento es de unos 5 µAU (Delbeck y Heise, 2021). La razón es de " + f(E.ir_medio.snr, 0) + " a 1, o sea " + f(E.ir_medio.limite_por_ruido_electronico_mg_dl, 2) + " mg/dL. " + RJ("El ruido del instrumento no es el límite.") + " Lo es la variación de la piel y de los otros solutos, que las fuentes no cuantifican."));
  resultados.push(P("Los límites de detección fotoacústicos publicados son 100 mg/dL (epidermis humana ex vivo, Kottmann et al., 2012), 57 mg/dL, 25 mg/dL y 12,5 mg/dL con dos láseres, los tres últimos citados por una revisión (Kaysir et al., 2023). En piel viva, el resultado fue ±30 mg/dL al 90 % de confianza (Kottmann et al., 2016), o sea σ ≈ " + f(E.fotoacustico.sigma_de_30_al_90, 1) + " mg/dL. Separar 70 de 54 mg/dL exige distinguir 16 mg/dL. Con un umbral a 62 mg/dL, acertar 90 % de las veces pide σ de " + f(C.sigma_max_para_separar_70_de_54_90, 1) + " mg/dL o menos, y 95 % pide " + f(C.sigma_max_para_separar_70_de_54_95, 1) + " mg/dL."));
  resultados.push(...tabla(["Límite", "Cálculo", "Resultado", "Lectura"], [
    ["IR medio, ruido del instrumento", "100 mg/dL / (2 mAU / 5 µAU)", f(E.ir_medio.limite_por_ruido_electronico_mg_dl, 2) + " mg/dL", "No es el cuello de botella"],
    ["Fotoacústico, límites publicados", "100, 57, 25 y 12,5 mg/dL frente a la brecha de 16 mg/dL", "Solo 12,5 mg/dL queda bajo la brecha, con dos láseres", RJ("En piel viva el resultado es ±30 mg/dL al 90 %, σ ≈ " + f(E.fotoacustico.sigma_de_30_al_90, 0) + " mg/dL")],
    ["Polarimetría", "0,0056 grados por 10 mg/dL y por mm × 16 / 10", f(E.polarimetria.rotacion_de_la_brecha_por_mm, 4) + " grados por mm para la brecha", "Hay que resolver milésimas de grado, con el confusor de la córnea"],
    ["Agua en radiofrecuencia", "Permitividad del agua, −0,45 % por grado (cálculo, no cifra impresa)", "Para 16 mg/dL (0,89 mmol/L) con un efecto de 0,01 a 0,02 % por mmol/L, la temperatura debe fijarse a " + f(E.agua_rf.temperatura_equivalente_K[0], 2) + " a " + f(E.agua_rf.temperatura_equivalente_K[1], 2) + " °C", RJ("El efecto de la glucosa por mmol/L viene de un resultado de búsqueda sin abrir. Valor sin verificar")],
    ["Piso de la referencia (ISO 15197:2013)", "σ_ref = 15 / 1,96 mg/dL, MARD = 0,798 σ_ref / glucosa", "MARD de la referencia en el límite: " + f(E.referencia_iso15197.mard_de_la_referencia_en_el_limite_pct["70"], 1) + " % a 70 mg/dL y " + f(E.referencia_iso15197.mard_de_la_referencia_en_el_limite_pct["54"], 1) + " % a 54 mg/dL", "Un aparato perfecto se vería con 8,7 % a 70 mg/dL. Uno con 12 % real se vería con " + f(E.referencia_iso15197.mard_observado_si_el_real_a_70_es["12.0"], 1) + " %"],
  ], [2100, 2600, 2600, 2338], { pad: 55 }));
  resultados.push(P("La ISO 15197:2013 acepta ±15 mg/dL bajo 100 mg/dL y ±15 % desde 100 mg/dL (citada en Sharif-Nia et al., 2025). La proporción de 95 % y el criterio de 99 % en zonas A y B no se confirmaron en una fuente abierta. Los CGM se comparan con YSI, mejor que ese límite. Aun así, el error de la referencia se combina en raíz cuadrada con el del dispositivo (Smith, 2023)."));
  resultados.push(H3("Exposición del láser en la piel"));
  resultados.push(P("El límite de exposición de la piel es de 0,1 W/cm² para 2,6 a 1000 µm, entre 10 s y 3 × 10⁴ s, y de 0,2 CA W/cm² para 0,4 a 1,4 µm, con CA = 10^(0,002 (λ − 700 nm)), promediado en una apertura de 3,5 mm (Auburn University Radiation Safety Office, 2007). " + RJ("Es una fuente secundaria, basada en la edición ANSI Z136.1 del año 2000. No se abrió IEC 60825-1 ni ANSI Z136.1-2022, y la fórmula de CA se vio en un fragmento de otro manual.")));
  const L = E.laser.filas;
  resultados.push(...tabla(["Sistema", "Potencia", "Límite aplicado", "Área mínima del haz", "Observación"], [
    ["DiaMonTech, QCL de 8 a 10 µm (Kaluza et al., 2025)", "10 mW promedio", f(L[0].limite_W_cm2, 1) + " W/cm²", f(L[0].area_minima_cm2, 2) + " cm², diámetro de " + f(L[0].diametro_minimo_mm, 1) + " mm", RJ("Los autores midieron 0,137 W/cm² y lo comparan con 0,5 W/cm² (27 %). Con el límite del manual leído serían 1,4 veces. Discrepancia sin resolver")],
    ["Fotoacústico de Kottmann (2016)", "2 mW tras bajar de 8 mW", f(L[1].limite_W_cm2, 1) + " W/cm²", f(L[1].area_minima_cm2, 2) + " cm², diámetro de " + f(L[1].diametro_minimo_mm, 1) + " mm", "Los autores redujeron la potencia para cumplir el límite"],
    ["Raman de RSP, 830 nm (Lundsgaard-Nielsen et al., 2018)", "300 mW", f(L[2].limite_W_cm2, 2) + " W/cm²", f(L[2].area_minima_cm2, 2) + " cm², diámetro de " + f(L[2].diametro_minimo_mm, 1) + " mm", "El tamaño del haz no figura en la fuente leída"],
    ["Raman de Kang (2020) en cerdos, 830 nm", "250 mW", f(L[3].limite_W_cm2, 2) + " W/cm²", f(L[3].area_minima_cm2, 2) + " cm², diámetro de " + f(L[3].diametro_minimo_mm, 1) + " mm", RJ("Con su punto de 1 × 2 mm da " + f(L[3].veces_el_limite_con_spot_informado, 0) + " veces el límite")],
    ["Raman de Liom (Rothenbühler et al., 2026)", "Menos de 100 mW", f(L[4].limite_W_cm2, 2) + " W/cm²", f(L[4].area_minima_cm2, 2) + " cm², diámetro de " + f(L[4].diametro_minimo_mm, 1) + " mm", "Se supuso 785 nm porque la longitud de onda no se informa"],
    ["Raman a 785 nm (Todaro et al., 2022)", "400 mW", f(L[5].limite_W_cm2, 2) + " W/cm²", f(L[5].area_minima_cm2, 2) + " cm², diámetro de " + f(L[5].diametro_minimo_mm, 1) + " mm", "Un haz de más de 13 mm no es un parche pequeño"],
  ], [2400, 1250, 1300, 1900, 2788], { pad: 55 }));
  resultados.push(P("Un Raman de 300 mW, si el límite aplicado vale, necesita repartir la luz en un haz de al menos 10 mm de diámetro. Los equipos de mesa pueden hacerlo. Un parche para dormir es otra cosa. Además, la norma carece de guía para pulsos de nanosegundos a 8 a 10 µm (no se halló valor)."));

  // ---- Limites practicos
  resultados.push(H2("3.7 Límites prácticos"));
  resultados.push(P("Los números de las tablas anteriores son los mejores. Lo que sigue muestra cuánto se pierde al salir de la clínica y qué exige cada tecnología al usuario."));
  resultados.push(...tabla(["Límite práctico", "Cifra", "Fuente"], [
    ["De la clínica a la casa", RJ("RSP: 12,8 % en clínica con calibración corta, y 25,8 % en casa en un estudio anterior.") + " Liom: 25,9 % en euglucemia y 12,4 % en hiperglucemia. Afon: 28 % y luego 44 % sin recalibrar al día siguiente. GlucoTrack: 22,3 % en clínica y 25,5 % en casa", "Pors et al. (2025), Lundsgaard-Nielsen et al. (2018), Rothenbühler et al. (2026), Handy et al. (2024), Bahartan et al. (2017), Smith (2023)"],
    ["Calibraciones", "DiaMonTech: 3 o más calibraciones invasivas el día 1 (dato de la empresa). Cnoga: 25 calibraciones. NIR 2026: 10 pares. RSP: 4 h de calibración. mμSORS y Liom: ninguna por persona", "Kang et al. (2026), Leung et al. (2023), Amuedo et al. (2026), Pors et al. (2025), Zhang et al. (2025)"],
    ["Tiempo por medición", "DIROS: 1,5 min por espectro. Raman de RSP: unos 3 min. DiaMonTech: 4 min, con meta de 10 a 20 s. mμSORS: 8 min (dato de una nota de prensa). Raman de Kang: 285 s por cuadro", "Uluç et al. (2024), Lundsgaard-Nielsen et al. (2018), Kaluza et al. (2025), DZD (2025), Kang et al. (2020)"],
    ["Tamaño y costo", "Caja de zapatos (DiaMonTech), escritorio (mμSORS). Dos espectrómetros Raman con precio publicado cuestan USD 15.200 (6 kg) y USD 22.660. No se halló precio de láseres de cascada cuántica ni de Raman de mano. Un CGM de venta libre cuesta USD 54 por 2 semanas", "Kang et al. (2026), DZD (2025), PMOptics (s. f.), Abbott (s. f.)"],
    ["Vacío bajo 70 mg/dL", RJ("Ningún estudio óptico abierto informa MARD ni sensibilidad bajo 70 mg/dL.") + " DiaMonTech tuvo referencia mínima de 66 mg/dL. Glucube informa solo error absoluto de 24,9 mg/dL bajo 100 mg/dL. Liom tuvo poca hipoglucemia. Ocho de nueve estudios de CGM en hipoglucemia hospitalaria tuvieron MARD sobre 15 %", "Kaluza et al. (2025), Gómez-Peralta et al. (2024), Rothenbühler et al. (2026), Prince et al. (2026)"],
    ["Estudios pequeños y sobreajuste", RJ("De 37 estudios de aprendizaje automático óptico, 73 % tuvo menos de 100 personas y solo 2 hicieron prueba prospectiva.") + " Un modelo entrenado con ruido gaussiano llegó a 25 % de MARD, y quitar la señal fotoacústica subió el MARD de 35,0 a 43,1 %. Con división por participante, cinco métodos de PPG caen a R² cercano a cero", "Ahmed y Noury (2026), Blanc et al. (2026, preprint), Ramesh et al. (2026, preprint)"],
    ["Confusores de la piel", "El estrato córneo y el espinoso son más gruesos en diabetes tipo 2. El lactato se solapa con la glucosa a 1040 y 1125 cm-1. Casi cualquier parámetro fisiológico se correlaciona con la curva de una prueba oral de glucosa", "Chen et al. (2024), Uluç et al. (2024), Smith (2023)"],
  ], [1900, 4900, 2838], { pad: 55, juntas: false }));

  // ---- Fusion
  resultados.push(H2("3.8 Fusión y redundancia"));
  resultados.push(H3("Fusión de valores"));
  resultados.push(P("Si N sensores iguales miden la misma glucosa con errores de la misma desviación σ y correlación ρ entre ellos, la desviación fusionada es σ_f / σ = √((1 + (N − 1) ρ) / N). Cuando N crece, el límite es √ρ. Con ρ = 0 el ruido baja como 1/√N. Con ρ distinto de cero hay un piso."));
  resultados.push(...figura("f12-fusion.png", "Ruido fusionado sobre ruido de un solo sensor, según el número de sensores iguales y la correlación entre sus errores. Las líneas punteadas son los límites √ρ. Los puntos son los dos valores de ρ estimados con la redundancia de dos electrodos de un CGM (Sharifi et al., 2016).", 600));
  resultados.push(P("**Correlación estimada.** El único dato medido es de un CGM con dos electrodos en una inserción: MARD de 10,1 % el sensor redundante, frente a 11,4 % y 12,0 % cada electrodo solo, con 23 adultos con DT1 y 3.297 pares (Sharifi et al., 2016). Si el MARD es proporcional a σ y N = 2, ρ = 2r² − 1, con r = 10,1 / 11,7 = " + f(Bf.rho_estimado.razon_todos, 2) + ". Sale ρ ≈ **" + f(Bf.rho_estimado.todos_los_dias, 2) + "**. Contra YSI en los días 4 y 7 (9,4 % frente a 9,6 y 9,9 %, diferencia no significativa) sale ρ ≈ " + f(Bf.rho_estimado.contra_YSI_dias_4_y_7, 2) + ". Dos electrodos del mismo sensor comparten tejido, retraso y referencia. Para sensores de principios distintos el valor puede ser menor, pero " + RJ("no hay ningún estudio que mida la correlación de errores entre dos modalidades de glucosa") + ", y los confusores comunes, como temperatura e hidratación, la suben."));
  resultados.push(P("**Mínimos cuadrados generalizados.** Con una matriz de covarianza S de elementos s_i s_j ρ, los pesos son w = S⁻¹ 1 / (1' S⁻¹ 1) y la varianza fusionada es 1 / (1' S⁻¹ 1). Como el MARD es proporcional a σ, se trabaja con MARD. Entradas: Raman sin calibrar, 14,5 % (Rothenbühler et al., 2026, Zhang et al., 2025), infrarrojo medio, 20 % (Kaluza et al., 2025), y una tercera vía de 25 %, un supuesto cercano al Raman de RSP en casa (Lundsgaard-Nielsen et al., 2018)."));
  const G = Bf.gls;
  const nombresG = ["Raman 14,5 / IR medio 20 / tercera 25", "Raman 14,5 / IR medio 20", "tres sensores de 20", "tres sensores de 25"];
  const celdaG = (n, r) => {
    const v = G[n][r].mard_fusionado;
    return f(v, 1) + " %";
  };
  resultados.push(...tabla(["Combinación de MARD", "ρ = 0", "ρ = 0,3", "ρ = 0,5", "ρ = 0,7"],
    nombresG.map((n) => [n, celdaG(n, "0.0"), celdaG(n, "0.3"), celdaG(n, "0.5"), celdaG(n, "0.7")]), [3600, 1500, 1500, 1519, 1519], { centrar: true }));
  resultados.push(P("MARD fusionado, en porcentaje. Con ρ = 0,7 la mejor combinación da un peso negativo de " + f(G[nombresG[0]]["0.7"].pesos[2], 2) + " a la tercera vía, un resultado frágil. Con ρ = 0,5 la tercera vía pesa " + f(G[nombresG[0]]["0.5"].pesos[2], 2) + " y no aporta nada."));
  resultados.push(...recuadro("Regla 2: la fusión de valores no alcanza", [
    "Con ρ = 0,3, la regla de la falta de dato, la mejor combinación da **" + f(G[nombresG[0]]["0.3"].mard_fusionado, 1) + " %**. " + RJ("Es más que el 12 % que pide R-B y más que el 10 % que pide R-C."),
    "Con la correlación medida en la literatura, ρ ≈ " + f(Bf.rho_estimado.todos_los_dias, 2) + ", da **" + f(G[nombresG[0]]["0.5"].mard_fusionado, 1) + " %**, apenas 0,5 puntos mejor que el Raman solo.",
    "Para llegar a 12 % la correlación debe ser de " + f(Bf.rho_maximo_12, 2) + " o menos. " + RJ("Para llegar a 10 % no alcanza, con estas tres vías, ni con errores totalmente independientes, porque ρ = 0 da " + f(G[nombresG[0]]["0.0"].mard_fusionado, 1) + " %") + ". Con sensores iguales de 14,5 %, llegar a 12 % pide ρ de " + f(Bf.rho_limite_sensores_de_14_5_para_12, 2) + " o menos, y a 10 % pide ρ menor que " + f(Bf.rho_limite_sensores_de_14_5_para_10, 2) + ", aun con infinitos sensores.",
  ], ROJO_CLARO, ROJO));
  resultados.push(P("**Lo que logró la realidad.** GlucoTrack combinó ultrasonido, electromagnético y térmico y obtuvo una diferencia relativa absoluta media de 22,3 a 29,9 %, y 25,5 % en casa según un póster de 2011 (Bahartan et al., 2017, Harman-Boehm et al., 2009, Smith, 2023). Solianis y Biovotion sumaron impedancia y ópticos y pasaron de 18,0 % en la visita 1 a 27,3 % en la visita 2 con los mismos coeficientes, 21,1 % en el modelo global y 35,4 % en casa (Caduff et al., 2009, 2015, Zanon et al., 2018). " + RJ("Ninguna de las dos combinaciones superó a su mejor componente solo.") + " La empresa de GlucoTrack dejó lo no invasivo en 2023 (Drug Delivery Business, 2023). Smith (2023) llama “hacer el martillo más pesado” a sumar técnicas cuando la primera no basta, y dice que suele indicar que la señal no era suficiente. Es opinión de un experto y no un estudio, pero coincide con estas cifras."));
  resultados.push(P("**Redundancia medida en CGM.** Dos electrodos en un sensor bajaron el MARD de 11,4 y 12,0 % a 10,1 % (Sharifi et al., 2016). El sensor ortogonal, con óptico y electroquímico, quedó en 10,5 % frente a 11,0 % en la semana, sin diferencia significativa (P = 0,34), pero mejoró el día 1 (10,7 % frente a 16,5 %) y la supervivencia del sensor fue de 92,1 % frente a 74,4 %, sin diferencia significativa (P = 0,10) (McAuley et al., 2016). La redundancia ayuda a la confiabilidad más que a la exactitud."));

  // ---- Ruido y alarma
  resultados.push(H3("De MARD a ruido por lectura, y la alarma simulada"));
  resultados.push(P("Para un error normal, el error absoluto medio es σ √(2/π) = 0,798 σ. Entonces σ ≈ MARD × glucosa / 0,798, evaluado cerca de 70 a 100 mg/dL."));
  resultados.push(...tabla(["MARD", "σ a 70 mg/dL", "σ a 85 mg/dL", "σ a 100 mg/dL"],
    ["8.0", "10.0", "12.0", "14.5", "20.0", "25.0"].map((m) => [f(parseFloat(m), 1) + " %", f(C.sigma_equivalente_mg_dl[m]["70"], 1) + " mg/dL", f(C.sigma_equivalente_mg_dl[m]["85"], 1) + " mg/dL", f(C.sigma_equivalente_mg_dl[m]["100"], 1) + " mg/dL"]),
    [2000, 2546, 2546, 2546], { centrar: true }));
  resultados.push(P("Un MARD de 20 % equivale a σ de unos 21 mg/dL a 85 mg/dL, más de tres veces los 5,9 mg/dL en que la simulación del repositorio dejó de ganar con dos profundidades (Ríos Elgueta, 2026b). Los σ de 5, 8, 13 y 18 mg/dL corresponden a MARD de unos 5, 8, 12 y 17 % a 85 mg/dL."));
  resultados.push(P("**Simulación.** Se usó la curva de sangre del repositorio, con un episodio de hipoglucemia con mínimo de 50 mg/dL a los 300 minutos y 52 minutos bajo 70 mg/dL. La capa es la profundidad 1 con τ = 6 minutos, suavizada con el filtro de una profundidad del repositorio, y la alarma suena al cruzar 70 mg/dL. Son 40 réplicas por σ. El atraso es el tiempo en que suena la alarma del sensor menos el de la sangre."));
  const simB = C.simulacion.filas;
  resultados.push(...tabla(["σ (mg/dL)", "Hipoglucemias detectadas", "Falsas alarmas por registro", "Atraso medio (min)", "Atraso p10 a p90 (min)", "Falsas alarmas sin filtro"],
    simB.filter((x) => [0, 5, 8, 13, 18, 25, 35].includes(x.sigma)).map((x) => [x.sigma === 0 ? "0 (referencia)" : f(x.sigma, 0), pc(x.fraccion_detectada), f(x.falsas_alarmas_por_registro, 2), f(x.atraso_medio_min, 1), f(x.atraso_p10_p90_min[0], 1) + " a " + f(x.atraso_p10_p90_min[1], 1), f(x.lectura_cruda.falsas_alarmas_por_registro, 2)]),
    [1500, 1700, 1700, 1500, 1700, 1538], { centrar: true }));
  resultados.push(P("Con ruido blanco detecta 100 % de las hipoglucemias, aun con σ de 35 mg/dL, y casi no genera falsas alarmas. Ese resultado es [[optimista]] por tres razones. El ruido es blanco, independiente entre lecturas, sin deriva. El filtro conoce el σ exacto. Y la curva baja a 50 mg/dL, 20 mg/dL bajo el umbral. En sensores reales el error es lento y correlacionado, y el sesgo entre personas domina. Por eso se agregó un cálculo con error lento."));
  const simL = C.simulacion_error_lento.filas;
  const nochL = C.simulacion_error_lento.noches_sin_hipoglucemia;
  resultados.push(P("**Error lento (Propuesta del análisis).** El error es una serie AR(1) con correlación de 60 minutos y desviación σ, sin ruido blanco. La forma del error no está en ningún estudio y se supone. Además se simularon noches de 8 horas sin hipoglucemia, con glucosa media de 100 mg/dL y una oscilación de 8 mg/dL, y un silencio de 30 minutos tras cada alarma."));
  resultados.push(...tabla(["σ (mg/dL)", "Hipoglucemias detectadas", "Atraso medio (min)", "Atraso p10 a p90 (min)", "Falsas alarmas por noche a 100 mg/dL", "Falsas alarmas por noche a 90 mg/dL"],
    simL.filter((x) => [5, 8, 13, 18, 25, 35].includes(x.sigma)).map((x) => {
      const n = nochL[String(x.sigma)];
      return [f(x.sigma, 0), pc(x.fraccion_detectada), f(x.atraso_medio_min, 1), f(x.atraso_p10_p90_min[0], 1) + " a " + f(x.atraso_p10_p90_min[1], 1),
        n ? f(n["100"].falsas_alarmas_por_noche_con_silencio_30min, 2) : "sin calcular", n ? f(n["90"].falsas_alarmas_por_noche_con_silencio_30min, 2) : "sin calcular"];
    }),
    [1300, 1700, 1500, 1700, 1800, 1638], { centrar: true }));
  resultados.push(P(RJ("Con error lento, σ de 13 mg/dL ya deja pasar 7 % de las hipoglucemias y genera 0,42 falsas alarmas por noche a 100 mg/dL. Con σ de 18 mg/dL son 1,02 por noche, y con 25 mg/dL, 1,90.") + " El atraso se abre: con σ de 13 mg/dL va de −3,4 a 21,4 minutos. Un sensor que ya erró hacia arriba suena tarde, y uno que erró hacia abajo suena antes de tiempo, o suena sin motivo."));

  // ---- Alarma nocturna
  resultados.push(H3("Fusión de decisiones para la alarma nocturna"));
  resultados.push(P("La tasa base es de 0,54 hipoglucemias nocturnas por semana, la mediana de 3.696 personas con DT1 en su primer mes de CGM, con rango intercuartil de 0,0 a 1,5 (Mitter et al., 2025). Muchas personas tienen cero. Otro estudio halló 0,8 por semana en 185 personas con insulina múltiple (Eichenlaub et al., 2024). El valor predictivo positivo depende de esa tasa: VPP = Se × B / (Se × B + FA), con B = 0,54 y FA las falsas alarmas por semana."));
  resultados.push(P("Para dos vías independientes: Se_OR = 1 − (1 − Se₁)(1 − Se₂), FA_OR = FA₁ + FA₂, Se_AND = Se₁ Se₂ y, con procesos de Poisson y ventana de coincidencia w = 30 min a cada lado, FA_AND ≈ FA₁ FA₂ (2w) / T, con T = 56 horas nocturnas por semana. Para 2 de 3, Se = Se₁Se₂ + Se₁Se₃ + Se₂Se₃ − 2Se₁Se₂Se₃. Con dependencia moderada (0,3) se interpola entre el caso independiente y la dependencia total, de modo que Se_AND queda entre Se₁ Se₂ y min(Se₁, Se₂)."));
  const nomCanales = ["GlucoWatch G2", "Dexcom G7", "Dexcom G7 (pesimista)", "EEG subcutaneo", "Reloj inteligente", "EEG en el oido (hipotetico)", "Via optica sigma 13", "Via optica sigma 13 (error lento)", "Via optica sigma 18", "Via optica sigma 18 (error lento)", "Via optica sigma 25 (error lento)"];
  const bonCanal = (n) => ({ "GlucoWatch G2": "GlucoWatch G2", "Dexcom G7": "Dexcom G7, optimista", "Dexcom G7 (pesimista)": "Dexcom G7, pesimista", "EEG subcutaneo": "EEG subcutáneo (ya no es no invasivo)", "Reloj inteligente": "Reloj inteligente", "EEG en el oido (hipotetico)": "EEG en el oído (hipotético)" }[n] || bonito(n).replace(/^ó/, "Vía ó"));
  const fuenteCanal = (n) => {
    const m = n.match(/sigma (\d+)/);
    if (m && n.includes("error lento")) return "Simulación con error lento de σ " + m[1] + " mg/dL. FA = 7 × falsas alarmas por noche a 100 mg/dL con silencio de 30 min (supuesto del análisis)";
    if (m) return "Simulación con ruido blanco de σ " + m[1] + " mg/dL. FA = 7 × falsas alarmas por registro";
    return ({
      "GlucoWatch G2": "Sensibilidad nocturna con alerta de caída y 62 % de falsos positivos (Tsalikian et al., 2004b). FA con el supuesto de un episodio inducido por persona y día",
      "Dexcom G7": "Detección y alerta verdadera a 70 mg/dL (Garg et al., 2022). Se mantiene la razón falsas y verdaderas del estudio, lo que es optimista",
      "Dexcom G7 (pesimista)": "Igual, con el triple de falsas alertas (supuesto del análisis)",
      "EEG subcutaneo": "9 de 10 durmiendo y 0,2 falsas detecciones por semana de noche (Snogdal et al., 2012, Blaabjerg et al., 2019). Menos de 20 personas",
      "Reloj inteligente": "Sensibilidad 0,78 y especificidad 0,64, con 66 de 351 noches con hipoglucemia (Mendez et al., 2026). FA = 7 × (1 − Sp) × (1 − 66/351)",
      "EEG en el oido (hipotetico)": "Preprint de 5 personas, sin evidencia válida (Cabrera et al., 2020). Se usa como hipótesis, con especificidad por noche",
    })[n] || "";
  };
  resultados.push(...tabla(["Vía", "Se", "FA por semana", "VPP", "Fuente y supuesto"],
    nomCanales.map((n) => {
      const c = canal(n);
      return [bonCanal(n), pc(c.se), f(c.fa_semana, 2), pc(c.vpp), fuenteCanal(n)];
    }), [1700, 700, 900, 700, 5638], { pad: 55 }));
  resultados.push(P("**Supuestos de cada vía.** GlucoWatch: sensibilidad nocturna de 77 % con la alerta de caída y 62 % de falsos positivos (Tsalikian et al., 2004b). Para pasar a falsas alarmas por semana se supuso un episodio inducido por persona y día en el estudio de 24 horas, lo que da " + f(canal("GlucoWatch G2").fa_semana, 2) + " por semana en la noche. [[Es un supuesto del análisis.]] En el estudio el VPP fue 38 %, y a la tasa base real sale " + pc(canal("GlucoWatch G2").vpp) + ". Dexcom G7: detección de 87,6 a 88,8 % con alerta a 70 mg/dL, y alerta verdadera de 82,1 a 86,9 % (Garg et al., 2022, estudio patrocinado por Dexcom). Se mantuvo la razón de falsas y verdaderas, lo que es optimista porque el estudio indujo excursiones y tenía las alertas apagadas. El caso pesimista triplica las falsas alertas. EEG subcutáneo: 9 de 10 pacientes durmiendo y 0,2 falsas detecciones por semana de noche (Snogdal et al., 2012, Blaabjerg et al., 2019). Reloj: sensibilidad 0,78, especificidad 0,64 y VPP 0,25 con 351 noches de 36 adultos y 66 noches con hipoglucemia (Mendez et al., 2026), de donde salen " + f(canal("Reloj inteligente").fa_semana, 2) + " falsas alarmas por semana. EEG del oído: sensibilidad de 90 % o más y especificidad de 82 % o más, solo en canales del lado opuesto, en un preprint de 5 personas, y los canales del mismo oído no superaron el azar (Cabrera et al., 2020). " + RJ("No tiene evidencia válida según la regla 1, y sus cifras se usan solo como hipótesis.")));
  resultados.push(...figura("f13-alarmas.png", "Sensibilidad frente a valor predictivo positivo, con 0,54 eventos nocturnos por semana. La zona azul es la exigencia de la regla 0 y de R-B (85 % o más y 70 % o más). Los círculos llenos son vías solas y los vacíos son combinaciones. El punto 1' marca a GlucoWatch con el VPP del estudio. Todo lo que sale rojo queda fuera de la zona.", 640));
  const oido = "con EEG en el oido";
  const subc = "con EEG subcutaneo";
  const O13 = "Via optica sigma 13 (error lento)";
  const filasOido = [
    buscarCombo(oido, "Via optica sigma 13 Y EEG en el oido (hipotetico)"),
    buscarCombo(oido, `${O13} O EEG en el oido (hipotetico)`),
    buscarCombo(oido, `${O13} Y EEG en el oido (hipotetico)`),
    buscarCombo(oido, `${O13} Y EEG en el oido (hipotetico) (dependencia 0,3)`),
    buscarCombo(oido, `${O13} Y Reloj inteligente (dependencia 0,3)`),
    buscarCombo(oido, `2 de 3: ${O13}, EEG en el oido (hipotetico), Reloj inteligente`),
    buscarCombo(oido, `2 de 3: ${O13}, EEG en el oido (hipotetico), Reloj inteligente (dependencia 0,3)`),
    buscarCombo(oido, "Via optica sigma 18 (error lento) Y EEG en el oido (hipotetico) (dependencia 0,3)"),
    buscarCombo(oido, "EEG en el oido (hipotetico) Y Reloj inteligente (dependencia 0,3)"),
  ];
  const filasSubc = [
    buscarCombo(subc, `${O13} Y EEG subcutaneo (dependencia 0,3)`),
    buscarCombo(subc, `2 de 3: ${O13}, EEG subcutaneo, Reloj inteligente (dependencia 0,3)`),
    buscarCombo(subc, "Dexcom G7 Y EEG subcutaneo"),
    buscarCombo(subc, "Dexcom G7 Y EEG subcutaneo (dependencia 0,3)"),
    buscarCombo(subc, "Dexcom G7 O EEG subcutaneo"),
    buscarCombo(subc, "2 de 3: Dexcom G7, EEG subcutaneo, Reloj inteligente (dependencia 0,3)"),
    buscarCombo(subc, "Dexcom G7 O Reloj inteligente"),
  ];
  resultados.push(H3("Versión con EEG en el oído (el diseño propuesto)"));
  resultados.push(...tabla(["Combinación", "Se", "FA por semana", "VPP", "R-B"], filasOido.map(filaCombo), [4700, 800, 1400, 1100, 1638], { centrar: true, pad: 55 }));
  resultados.push(H3("Versión con EEG subcutáneo (ya no es no invasivo)"));
  resultados.push(...tabla(["Combinación", "Se", "FA por semana", "VPP", "R-B"], filasSubc.map(filaCombo), [4700, 800, 1400, 1100, 1638], { centrar: true, pad: 55 }));
  resultados.push(...recuadro("Regla 3: qué dicen las combinaciones", [
    "**Con ruido blanco todo pasa, y por eso no vale.** Una vía óptica con ruido blanco detecta 100 % sin falsas alarmas y cualquier combinación sale perfecta. Es el artefacto del modelo, no una propiedad del sensor.",
    "**Con error lento y el EEG del oído, el diseño propuesto no cumple.** Con σ de 13 mg/dL e independencia total, la combinación AND da sensibilidad de " + pc(filasOido[2].se) + " y VPP de " + pc(filasOido[2].vpp) + ". Con la dependencia moderada de la regla 3 baja a VPP de " + pc(filasOido[3].vpp) + ", y con σ de 18 mg/dL queda en " + pc(filasOido[7].vpp) + ". Esas cifras valen con un error lento supuesto (AR(1) de 60 min, sin estudio que lo mida). " + RJ("No llega a 70 %."),
    "**Con EEG subcutáneo sí llega, en papel.** Pero ese EEG ya no es no invasivo, y cuenta con 7 y 10 pacientes con percepción alterada, bajo el mínimo de 20 de la regla 1. El mismo cálculo se rompe con σ de 18 mg/dL e independencia: el 2 de 3 da VPP de " + pc(buscarCombo(subc, "2 de 3: Via optica sigma 18 (error lento), EEG subcutaneo, Reloj inteligente").vpp) + ".",
    "**El reloj no sirve como vía única ni como socio fuerte.** Con VPP de " + pc(canal("Reloj inteligente").vpp) + " solo, y " + f(canal("Reloj inteligente").fa_semana, 1) + " falsas alarmas por semana, un OR con el reloj sube las falsas alarmas a más de 2 por semana. Depende de la respuesta autonómica, que se apaga en la hipoglucemia inadvertida, 23,2 a 26,2 % de las personas con diabetes (Yu et al., 2023). La regla 3 prohíbe que sea la única vía.",
  ], ROJO_CLARO, ROJO));

  resultados.push(H3("Biomarcadores que no miden glucosa"));
  resultados.push(P("La regla 1 exige para estos biomarcadores sensibilidad y especificidad, o AUROC, con 20 participantes o más."));
  resultados.push(...tabla(["Biomarcador", "Evidencia", "Participantes", "Regla 1"], [
    ["EEG subcutáneo, detrás de la oreja", "9 de 10 durmiendo con cambios de EEG en hipoglucemia inducida (Snogdal et al., 2012). 15 de 15 detectados, a 29 ± 28 min antes de detener la insulina (Juhl et al., 2010). Piloto en casa con 0,2 falsas detecciones por semana de noche y 2,9 de día (Blaabjerg et al., 2019)", "10, 15 y 7", RJ("No pasa: menos de 20")],
    ["EEG en el oído", "Preprint con sensibilidad de 90 % o más y especificidad de 82 % o más en canales del lado opuesto. Los canales del mismo oído no superaron el azar (Cabrera et al., 2020)", "5", RJ("No pasa: 5 y sin revisión")],
    ["EEG de cuero cabelludo con clasificador", "Exactitud de 0,96 dentro del mismo sujeto, sin sensibilidad ni especificidad (Kubaščík et al., 2026)", "2", RJ("No pasa: 2 y sin validación entre personas")],
    ["EEG en niños", "El algoritmo de adultos detectó la hipoglucemia diurna en los 8 niños, pero de noche dio demasiadas falsas alarmas por el sueño profundo (Hansen et al., 2016)", "8", RJ("No pasa: 8, y falla de noche")],
    ["ECG y EEG", "El intervalo QT cambió en 6 de 9 y la potencia theta del EEG en 8 de 9 (Larsen et al., 2013)", "9", RJ("No pasa: 9")],
    ["Pulso, sudor, temperatura y temblor", "Sensibilidad de 100 % y especificidad de 85,7 % durante tres noches, con pocos eventos y sin replicación hallada (Schechter et al., 2012)", "10", RJ("No pasa: 10")],
    ["Reloj inteligente, modelo entre personas", "AUROC de 0,76 ± 0,07 (Lehmann et al., 2023)", "22", "Pasa, pero con AUROC bajo"],
    ["Reloj inteligente, modelo personal", "AUROC de 0,74, sensibilidad de 0,71 y especificidad de 0,76 (Mohamed et al., 2025)", "18", RJ("No pasa: 18")],
    ["Reloj inteligente, noche temprana", "Sensibilidad de 0,78, especificidad de 0,64 y VPP de 0,25 con 66 noches de hipoglucemia (Mendez et al., 2026)", "36", "Pasa, y confirma un VPP bajo"],
  ], [2300, 4800, 1100, 1438], { pad: 55 }));
  resultados.push(P("Una prueba de fusión en otro campo muestra lo que se espera de una segunda señal. En UCI, confirmar las alarmas de ECG con la forma de onda de la presión arterial suprimió 59,7 % de las falsas alarmas críticas, con 0 % de alarmas verdaderas suprimidas salvo 9,4 % en taquicardia ventricular (Aboukhalil et al., 2008, 447 registros). Sirve donde las dos señales están disponibles y miden fenómenos distintos."));

  // ---- Modelos de fusion
  resultados.push(H3("Modelos matemáticos de fusión"));
  resultados.push(P("Todavía no hay una familia ganadora. Esta tabla lista las candidatas con sus supuestos y su punto de falla. Es Propuesta del análisis y no se probó ninguna con datos propios."));
  resultados.push(...tabla(["Modelo", "Qué combina", "Supuestos", "Dónde falla", "Ejemplo publicado"], [
    ["Pesos por varianza inversa", "Valores de varios sensores", "Errores independientes y varianza conocida", "Si los errores se correlacionan, el peso queda mal asignado", "Con ρ = 0,49 entre dos electrodos, la ganancia fue de 11,7 a 10,1 % (Sharifi et al., 2016)"],
    ["Mínimos cuadrados generalizados", "Valores con matriz de covarianza completa", "Covarianza conocida", "Con ρ alto aparecen pesos negativos, que son frágiles. No hay covarianza medida entre modalidades", "Cálculo de este análisis, 10,6 a 14,2 % según ρ"],
    ["Intersección de covarianzas", "Estimaciones con correlación desconocida", "Solo se conocen las varianzas individuales", "Es conservadora y entrega poco", "Ignorar las correlaciones puede degradar o divergir, y la intersección es la salida conservadora (Wikipedia contributors, s. f.). No hay estudio de CGM"],
    ["Filtro de Kalman", "Mediciones ruidosas con un modelo de dinámica", "Ruido blanco, modelo conocido", "Un sesgo común del sensor no se corrige: 3 de 4 fallas tuvieron sesgo positivo de 58, 36 y 25 mg/dL (Cameron et al., 2012)", "Suavizado de CGM con parámetros que se actualizan en línea (Facchinetti et al., 2011)"],
    ["Kalman con modelo fisiológico", "CGM con un modelo de glucosa e insulina", "Modelo bien identificado por persona", "Cambios de la persona, retraso variable", "Modelo mínimo de Bergman con filtro unscented detectó 61 de 63 comidas en 9 pacientes (Turksoy et al., 2016). Predicción de hipoglucemia con estimación óptima (Palerm et al., 2005)"],
    ["Detección de fallas por innovaciones", "Sensor y modelo, para avisar cuando no concuerdan", "Modelo personalizado", "Casi toda la prueba fue simulada, con 3 personas reales", "Falsos positivos bajo 10 % en 100 pacientes simulados (Facchinetti et al., 2013)"],
    ["Fusión de decisiones, AND, OR y k de n", "Alarmas de varias vías", "Falsas alarmas independientes", "OR suma las falsas alarmas y AND pierde sensibilidad. Con dependencia pierde la ganancia", "Fusión de ECG con presión arterial en UCI (Aboukhalil et al., 2008). Correlacionar sensores dio VPP de 4 a 81 % según el escenario (Bitan y O'Connor, 2012)"],
    ["Combinación bayesiana", "Probabilidades de cada vía con la tasa base", "Verosimilitudes bien calibradas", "Necesita muchos eventos para calibrar", "Sin ejemplo verificado en diabetes. Un resumen de búsqueda de 2015 no se abrió"],
    ["Aprendizaje automático multisensor", "Señales crudas de varios sensores", "Datos suficientes y validación por participante", "Aprendizaje por atajo y sobreajuste", "37 estudios, 73 % con menos de 100 personas (Ahmed y Noury, 2026). Una revisión de 12 estudios halló MARD solo en 2 (Ahmed et al., 2023)"],
    ["Kalman multimodelo con factor de olvido", "Sensores redundantes con exactitud cambiante", "Ruido independiente por sensor", "No evaluó la correlación entre sensores", "Dos cerdos (Al Ahdab et al., 2023)"],
  ], [1450, 1650, 1650, 2300, 2588], { pad: 50 }));
  resultados.push(...recuadro("Dónde la fusión no puede ayudar", [
    "**Retraso común.** Si todos los sensores ven la misma capa de líquido intersticial, comparten el mismo retraso, y ninguna combinación lo corrige.",
    "**Confusores comunes.** La temperatura y la hidratación entran a todos los canales. En el multisensor de Solianis el espectro de impedancia mezcla dos efectos, uno de glucosa y otro de hidratación de la piel (Mueller et al., 2011).",
    "**Referencia común.** Todos los estudios se miden contra una referencia con su propio error. Unos pocos pares mueven mucho el MARD y la exactitud de la referencia lo afecta de forma sustancial (Kirchsteiger et al., 2015). Por eso un MARD de un estudio no es comparable con el de otro.",
  ], ROJO_CLARO, ROJO));

  // ---- Mercado
  resultados.push(H2("3.9 Comparación con el mercado"));
  resultados.push(P("**CGM actuales.** La tabla separa la cifra de la empresa de la medición independiente. Una comparación directa en 24 adultos con DT1 dio MARD de 11,6 % para Libre 3 y de 12,0 % para el Dexcom G7 frente a YSI, contra 7,6 a 8,2 % declarados por las empresas (Eichenlaub et al., 2026, estudio independiente)."));
  resultados.push(...tabla(["CGM", "Cifra de la empresa", "Cifra independiente", "Hipoglucemia", "Precio"], [
    ["Dexcom G7 15 días", "MARD 8,0 % (dato de la empresa, Dexcom, 2025). 510(k): 8,2 % en 70 a 180 mg/dL", "12,0 % frente a YSI (Eichenlaub et al., 2026)", RJ("14,9 % bajo 54 mg/dL") + ", 9,1 % de 54 a 69 (Innolitics, 2025). Detección de 87,6 a 88,8 % a 70 mg/dL (Garg et al., 2022)", "Sin dato abierto"],
    ["FreeStyle Libre 3", "MARD 7,9 % (dato de la empresa, Abbott, 2022)", "11,6 % frente a YSI (Eichenlaub et al., 2026)", "Sin dato abierto de alertas", "Sin dato abierto"],
    ["Eversense 365 (implantable)", "MARD 8,8 %, 110 adultos, autores de la empresa (Bailey et al., 2025)", "Sin dato independiente hallado", "Detección de alerta confirmada de 96,6 % a 70 mg/dL", "Sin verificar"],
    ["Abbott Lingo (venta libre)", "510(k): MARD de 9,9 % bajo 70 mg/dL y de 11,5 % los días 1 a 3, adultos sin insulina (Innolitics, 2024)", "Sin dato independiente hallado", "91,5 % dentro de ±15 mg/dL bajo 70 mg/dL", "USD 54 por 2 semanas (Abbott, s. f.)"],
    ["Dexcom Stelo (venta libre)", "Sin cifra de exactitud propia en su página", "Sin dato independiente hallado", "Advierte no usar con hipoglucemia problemática", "USD 89 al mes (Dexcom, s. f.)"],
    ["Biolinq Shine (intradérmico)", "Rango de 70 a 400 mg/dL, 202 personas, supervivencia a 5 días de 84,7 % (FDA, 2025)", "Sin dato independiente hallado", RJ("Sin valores bajo 70 mg/dL y sin alarmas") + ", no se debe usar para conciencia de hipoglucemia", "Sin dato abierto"],
  ], [1700, 2400, 1700, 2438, 1400], { pad: 55 }));
  resultados.push(P("El mercado es grande. Dexcom facturó USD 4.662 millones en 2025 (Dexcom, 2026) y las ventas de CGM de Abbott fueron USD 2.000 millones solo en el cuarto trimestre de 2025, dentro de un segmento Diabetes Care de USD 7.998 millones en el año (Abbott, 2026). Son datos de las empresas. El criterio iCGM de la FDA pide, para glucosa bajo 70 mg/dL, 85 % dentro de ±15 mg/dL, 98 % dentro de ±40 mg/dL, y que no haya lecturas bajo 70 con referencia sobre 180 mg/dL (21 CFR 862.1355)."));
  resultados.push(P("**Intentos no invasivos y su desenlace.**"));
  resultados.push(...tabla(["Intento", "Técnica", "Cifra", "Desenlace"], [
    ["GlucoWatch G2 (Cygnus, Animas)", "Iontoforesis inversa", "Sensibilidad 23 a 24 % con la alarma sola, 51 a 62 % de falsos positivos (Tsalikian et al., 2004a, 2004b)", RJ("FDA en 2001, descontinuado en 2007") + ", activos vendidos por USD 10 millones según Smith (2023)"],
    ["Pendra (Pendragon)", "Bioimpedancia", "Diferencia absoluta media de 52 % (Wentholt et al., 2005)", "CE en 2003, la empresa cerró (Smith, 2023)"],
    ["Solianis y Biovotion", "Impedancia y ópticos", "MARD 18,0 y 27,3 %, 35,4 % en casa", "Activos a Biovotion en 2011, sin producto exitoso"],
    ["C8 MediSensors", "Raman", "Diferencia media de 38 mg/dL según Smith, 30 mg/dL en el artículo de la empresa (Lipson et al., 2009)", RJ("Más de USD 19 millones, cierre hacia 2013") + " (Smith, 2023)"],
    ["Echo Therapeutics", "No informada en la base", "Sin ensayos registrados", RJ("Desarrollo suspendido en septiembre de 2014") + " (Smith, 2023)"],
    ["Oculir y Alethus", "IR medio", "Sin cifras", "Cerraron a fines de 2007 y en 2016 (Smith, 2023)"],
    ["Sensys e ILS", "IR cercano", "Sin producto", "Más de 100 millones de dólares (Smith, 2023)"],
    ["Hitachi", "Calor metabólico", "Sin cifras", "Lanzamiento previsto para 2005, no consta que ocurriera (Hitachi, 2004)"],
    ["Lente de contacto de Verily", "Glucosa en lágrima", "Correlación no consistente", RJ("Detenido en noviembre de 2018") + " (Smith, 2023)"],
    ["GlucoTrack DF-F (Integrity)", "Ultrasonido, electromagnético y térmico", "ARD media de 22,3 a 29,9 %", RJ("La empresa dejó lo no invasivo en 2023") + ", ahora con un CGM implantable de MARD 7,7 % en 10 personas (Drug Delivery Business, 2023, MedTech Dive, 2025)"],
    ["Know Labs", "Radiofrecuencia", "MARD de 12,7 y 14,0 % (dato de la empresa)", RJ("Ya no hace ensayos en humanos") + " (USBC, 2025)"],
    ["SugarBEAT (Nemaura)", "Iontoforesis inversa", "MARD 11,92 % (comunicado de la empresa)", "CE clase IIb, salió de Nasdaq en enero de 2024 (Nemaura Medical, 2024)"],
    ["Afon Glucowear", "Microondas", "28 a 46 % de ARD, 75 % de acierto en una persona", "En desarrollo, sin autorización mencionada"],
  ], [2100, 1700, 2900, 2938], { pad: 55 }));
  resultados.push(P("Smith (2023) estima que llegar al mercado exige al menos 5 años y entre 25 y 30 millones de dólares. Tras 35 años en el campo, dice que no vio ninguna idea en su categoría “this will work” (0 de cientos). Es opinión de un experto con tono crítico, pero el desenlace de la tabla anterior la acompaña. Apple y Samsung no tienen fuente primaria abierta, y lo que circula sobre un reloj con glucosa es, según Smith, un malentendido: el director ejecutivo usaba un CGM de Dexcom."));

  // ------------------------------------------------------------------ discusion
  const discusion = [];
  discusion.push(H2("4.2 Rango de efectividad realista"));
  discusion.push(P("Tres casos para el artefacto propuesto, una vía óptica de infrarrojo medio con una vía de EEG en el oído. Los supuestos van explícitos en la última columna. Sirven para ver el ancho del rango, no para predecir un dispositivo."));
  const al = F.alarma_nocturna;
  discusion.push(...tabla(["Magnitud", "Optimista", "Esperado", "Pesimista", "Supuestos"], [
    ["MARD de la vía óptica", f(F.mard_via_optica.optimista, 1) + " %", f(F.mard_via_optica.esperado, 1) + " %", f(F.mard_via_optica.pesimista, 1) + " %", "Optimista: RSP con 4 h de calibración (Pors et al., 2025). Esperado: infrarrojo medio y cercano, 19,6 a 20,7 % y 20,3 %. Pesimista: Raman en casa (Lundsgaard-Nielsen et al., 2018)"],
    ["MARD fusionado", f(F.mard_fusionado.optimista, 1) + " %", f(F.mard_fusionado.esperado, 1) + " %", f(F.mard_fusionado.pesimista, 1) + " %", "Optimista: GLS de 14,5, 20 y 25 con ρ = 0,3. Esperado: GLS de 20, 25 y 25 con ρ = 0,5. Pesimista: sin ganancia, como GlucoTrack y Biovotion"],
    ["Retraso total (min)", f(F.retraso_total_min.optimista, 1), f(F.retraso_total_min.esperado, 1), f(F.retraso_total_min.pesimista, 1), "Retraso fisiológico más tiempo de medición. GlucoWatch: unos 20 min (Poddar et al., 2008). No incluye el suavizado del filtro, de unos 6 min en la simulación"],
    ["Sensibilidad nocturna", pc(al.optimista.se), pc(al.esperado.se), pc(al.pesimista.se), "Optimista: óptica σ 13 con error lento Y EEG del oído, independientes. Esperado: óptica σ 18 Y EEG del oído, dependencia 0,3. Pesimista: el EEG del oído no aporta y queda la vía óptica sola con σ 25"],
    ["Falsas alarmas por semana", f(al.optimista.fa_semana, 2), f(al.esperado.fa_semana, 2), f(al.pesimista.fa_semana, 1), "Tasa base 0,54 por semana, 8 horas por noche. GlucoWatch: " + f(F.glucowatch.fa_semana, 1) + " por semana con el supuesto del análisis"],
    ["VPP", pc(al.optimista.vpp), pc(al.esperado.vpp), pc(al.pesimista.vpp), "GlucoWatch: " + pc(F.glucowatch.vpp) + " a tasa base real, 38 % en el estudio. Dexcom G7: " + pc(F.dexcom_g7.vpp) + " en el caso optimista"],
  ], [1700, 1100, 1100, 1100, 4638], { centrar: false, pad: 55, juntas: false }));
  discusion.push(P("El caso optimista es el mejor que dan las cifras y los supuestos. " + RJ("Aun ahí, la sensibilidad queda en " + pc(al.optimista.se) + ", bajo el 85 % de R-B, y el MARD fusionado queda en " + f(F.mard_fusionado.optimista, 1) + " %, sobre el 12 % de R-B.") + " El caso esperado supera a GlucoWatch en el retraso y en las falsas alarmas, pero " + RJ("su VPP de " + pc(al.esperado.vpp) + " no llega a 70 %.") + " Ese rango de " + pc(al.esperado.vpp) + " a " + pc(al.optimista.vpp) + " sale de dos casos del cálculo: el esperado usa σ de 18 mg/dL con dependencia 0,3 y el optimista σ de 13 mg/dL con vías independientes. Ambos suponen un error lento (AR(1) de 60 min) que ningún estudio mide, y con ruido blanco el VPP sería 100 %. El pesimista es una vía óptica con error de unos 25 mg/dL, el error de Glucube bajo 100 mg/dL (Gómez-Peralta et al., 2024), y da " + RJ(f(al.pesimista.fa_semana, 0) + " falsas alarmas por semana.")));

  discusion.push(H2("4.3 Veredicto"));
  discusion.push(P("Cada regla se aplicó como se fijó el 29 de octubre de 2026. Los resultados negativos van en rojo."));
  discusion.push(...tabla(["Regla", "Resultado", "Evidencia"], [
    ["0. Mejor que GlucoWatch", RJ("No pasa"), "Con dependencia 0,3, el VPP de 70 % o más solo se alcanza con una vía óptica de ruido blanco o con EEG subcutáneo. Con el diseño propuesto, σ de 13 mg/dL y dependencia 0,3, el VPP es " + pc(filasOido[3].vpp) + " (con error lento supuesto, y con ruido blanco sería 100 %). El retraso sí es menor en papel. La calibración sin pinchazo solo la logran equipos de escritorio, y el infrarrojo medio pide 3 calibraciones el día 1. Sobre el sudor y la irritación no hay datos de uso nocturno"],
    ["1. Evidencia por biomarcador", RJ("No pasa"), "Infrarrojo medio: 19,6 y 20,7 %. DIROS: sin MARD y con 5 humanos sin cifras. EEG del oído: 5 personas. Pasan Raman con mμSORS (230 personas) y el reloj (36 personas), pero no son el diseño propuesto. Liom no cuenta, porque validó con solo 5 de sus 20 personas. Además, ningún estudio óptico abierto informa MARD ni sensibilidad bajo 70 mg/dL"],
    ["2. Fusión de valores", RJ("No pasa"), "Con ρ = 0,3 el MARD fusionado es " + f(G[nombresG[0]]["0.3"].mard_fusionado, 1) + " %, sobre 12 % y sobre 10 %. Con ρ medido de " + f(Bf.rho_estimado.todos_los_dias, 2) + " es " + f(G[nombresG[0]]["0.5"].mard_fusionado, 1) + " %"],
    ["3. Alarma multibiomarcador", RJ("No pasa"), "Con EEG del oído y dependencia 0,3, VPP de " + pc(filasOido[3].vpp) + " (con error lento supuesto, y con ruido blanco sería 100 %). En papel solo pasa con EEG subcutáneo, que no es no invasivo y tiene menos de 20 personas. El reloj tiene VPP de " + pc(canal("Reloj inteligente").vpp)],
    ["4. Premisa de dos profundidades", RJ("No pasa"), "Mejor caso " + f(A.mejor_separacion_min, 1) + " min, marginal. Caso intermedio " + f(A.separacion[1].separacion_epidermis_completa_vs_dermis_min, 1) + " min, no viable"],
    ["5. Práctica", RJ("No pasa"), "Ninguna versión portátil para dormir sin calibración diaria. DiaMonTech es del tamaño de una caja de zapatos, mμSORS es de escritorio con 8 min por medición (dato de una nota de prensa), DIROS es de mesa. Un Raman de 300 mW necesita un haz de al menos 10 mm si vale el límite aplicado"],
    ["6. Sentido de mercado", RJ("No pasa"), "Hay CGM de venta libre desde USD 54 por 2 semanas. Un no invasivo de 15 % o más no ofrece algo que ellos no ofrezcan, salvo no tener aguja, y su costo no se conoce"],
  ], [2300, 1300, 6038], { pad: 55, juntas: false }));
  discusion.push(H3("¿Supera a GlucoWatch?"));
  discusion.push(...recuadro("Respuesta: " + RJ("No."), [
    "Tal como se propuso, con un sensor óptico de infrarrojo medio y un audífono con EEG, el artefacto no supera a GlucoWatch en lo que decidió el equipo. " + RJ("Falla la regla 0 y fallan las reglas 1, 3, 4 y 5 que la apoyan.") + " No es condicional, porque lo que falla es la física de las capas y el hardware portátil, y ningún experimento barato lo resuelve.",
  ], ROJO_CLARO, ROJO));
  discusion.push(...tabla(["Falla de GlucoWatch", "Cifra de GlucoWatch", "Artefacto propuesto, en papel", "Veredicto"], [
    ["Falsas alarmas", "62 % de falsos positivos, VPP de 38 % en el estudio (Tsalikian et al., 2004b). Más de la mitad de 240 alarmas nocturnas fue incorrecta (Buckingham et al., 2005)", "VPP de " + pc(al.esperado.vpp) + " a " + pc(al.optimista.vpp) + " según el caso: " + pc(al.esperado.vpp) + " es el caso esperado (σ 18, dependencia 0,3) y " + pc(al.optimista.vpp) + " el optimista (σ 13, vías independientes), ambos con error lento supuesto", RJ("No pasa: bajo 70 % con dependencia moderada")],
    ["Retraso", "Unos 20 min (Poddar et al., 2008). La cifra de 18 min no se pudo verificar", "5 a 15 min según el caso", "Menor en papel, sin dato en personas"],
    ["Calibración con pinchazo", "Una calibración capilar (Tsalikian et al., 2004a)", "Infrarrojo medio: 3 o más calibraciones el día 1. Raman: ninguna, pero de escritorio", RJ("No pasa para infrarrojo medio")],
    ["Irritación de la piel", "76 % abandonó por irritación en el ensayo en niños (Chase et al., 2005)", "Óptico sin corriente. La luz queda en 27 % del límite según la empresa, con una discrepancia sin resolver", RJ("No demostrado en uso nocturno")],
    ["Lecturas saltadas y sudor", "56 % abandonó por saltos de lectura y 47 % por exceso de alarmas", "El efecto del sudor no se estudió en DIROS y es un confusor citado en DiaMonTech", RJ("No demostrado")],
    ["Sensibilidad en hipoglucemia", "23 a 24 % con la alarma sola y 88 % con la alerta de caída, 77 % de noche", pc(al.optimista.se) + " a " + pc(al.esperado.se), "Igual en papel, sin ventaja clara"],
    ["Error en hipoglucemia", "Diferencia absoluta mediana de 26 mg/dL. El MARD global de GlucoWatch G2 no está en la base, por eso se compara con esta cifra", "24,9 mg/dL bajo 100 mg/dL con NIR (Gómez-Peralta et al., 2024). DIROS: 34 a 40 mg/dL en ratones", RJ("Sin ventaja demostrada")],
  ], [1700, 2900, 2800, 2238], { pad: 55, juntas: false }));
  discusion.push(H3("¿Tiene sentido frente al mercado actual?"));
  discusion.push(...tabla(["Rubro", "Veredicto", "Razones"], [
    ["R-A. Bienestar o tendencia", RJ("No hoy"), "El Raman sin calibrar llega a 14,5 y 14,6 %, bajo el 20 % que pide el rubro, pero es de escritorio, tarda 8 min (dato de una nota de prensa) y no hay datos de dirección de la tendencia. El infrarrojo medio da 19,6 y 20,7 %, en el borde, con calibración. Un CGM de venta libre cuesta USD 54 por 2 semanas, y el no invasivo no tiene precio hallado. Fallan las reglas 5 y 6"],
    ["R-B. Alarma nocturna complementaria", RJ("No"), "Sensibilidad y VPP no llegan a la vez a 85 y 70 % con el EEG del oído y dependencia moderada. El MARD fusionado queda en " + f(F.mard_fusionado.optimista, 1) + " % en el mejor caso. Fallan las reglas 1, 2, 3, 5 y 6. Además, un Dexcom G7 solo da sensibilidad de " + pc(F.dexcom_g7.se) + " y VPP de " + pc(F.dexcom_g7.vpp) + " en el caso optimista"],
    ["R-C. Monitor que reemplaza al CGM", RJ("No viable"), "Con las tres vías de este análisis (14,5, 20 y 25 %), el MARD fusionado queda en " + f(G[nombresG[0]]["0.0"].mard_fusionado, 1) + " % aun con errores independientes, y el criterio de la FDA pide cerca de 10 % o menos con 98 % dentro de ±40 mg/dL bajo 70. Los CGM tienen 8,0 a 12,0 %. Los combinados en la realidad tuvieron 21 a 35 %"],
  ], [2400, 1400, 5838], { pad: 55, juntas: false }));
  discusion.push(P("Ninguno de los tres rubros es condicional, porque en todos falla la regla 5: nadie ha demostrado todavía un equipo portátil para uso nocturno, y eso no se resuelve con un experimento barato. Un experimento barato solo existiría si faltara una medición que ya se pudiera hacer con datos disponibles."));

  discusion.push(H2("4.4 Qué sí podría tener sentido (Propuesta)"));
  discusion.push(P("**Propuesta.** Lo que sigue es una idea del análisis, no una decisión del equipo ni una afirmación probada. Consiste en invertir el orden. En vez de que la vía no invasiva sea la principal, se ancla la alarma en la tecnología más madura, un CGM, y se le suman biomarcadores no invasivos para bajar las falsas alarmas y detectar fallas del sensor."));
  discusion.push(H3("Evidencia a favor"));
  discusion.push(B("La redundancia mide una mejora real en CGM: dos electrodos bajaron el MARD de 11,4 y 12,0 % a 10,1 %, y el sensor ortogonal mejoró el día 1. Su supervivencia de 92,1 % frente a 74,4 % no fue significativa (P = 0,10) (Sharifi et al., 2016, McAuley et al., 2016)."));
  discusion.push(B("En UCI, una segunda señal independiente suprimió 59,7 % de las falsas alarmas (Aboukhalil et al., 2008)."));
  discusion.push(B("En papel, un 2 de 3 con el G7, un EEG subcutáneo y un reloj da sensibilidad de " + pc(filasSubc[5].se) + " y VPP de " + pc(filasSubc[5].vpp) + " con dependencia 0,3. Un G7 con EEG subcutáneo, AND y dependencia 0,3, da VPP de " + pc(filasSubc[3].vpp) + ", pero su sensibilidad baja a " + pc(filasSubc[3].se) + ", bajo el 85 % de R-B."));
  discusion.push(B("La detección de fallas por innovaciones del Kalman ya se probó con falsos positivos bajo 10 % en simulación (Facchinetti et al., 2013)."));
  discusion.push(H3("Evidencia en contra"));
  discusion.push(B(RJ("Poco margen.") + " El G7 solo ya tiene VPP de " + pc(F.dexcom_g7.vpp) + " en el caso optimista y " + pc(canal("Dexcom G7 (pesimista)").vpp) + " en el pesimista, con " + f(canal("Dexcom G7").fa_semana, 2) + " a " + f(canal("Dexcom G7 (pesimista)").fa_semana, 2) + " falsas alarmas por semana. Hay poco que bajar."));
  discusion.push(B(RJ("El AND pierde sensibilidad.") + " Un G7 con un EEG subcutáneo da sensibilidad de " + pc(filasSubc[2].se) + " con independencia, bajo el 88 % del G7 solo, y OR sube las falsas alarmas. Con el EEG del oído en vez del subcutáneo, el 2 de 3 con el G7 y el reloj da VPP de 60 % con dependencia 0,3, peor que el 85 % del G7 solo en el caso optimista."));
  discusion.push(B(RJ("El sesgo común no se corrige.") + " 3 de las 4 fallas de un Kalman con CGM fueron sesgo positivo del sensor (Cameron et al., 2012)."));
  discusion.push(B(RJ("Los biomarcadores candidatos no cumplen la regla 1.") + " El EEG subcutáneo tiene menos de 20 personas y no es no invasivo, el EEG del oído tiene 5, y el reloj tiene VPP de 15 a 25 %."));
  discusion.push(B(RJ("No hay estudio que mida la correlación de errores entre un CGM y un biomarcador no invasivo.") + " La ganancia en papel depende de ese número."));
  discusion.push(H3("El experimento más barato que podría cambiar el veredicto"));
  discusion.push(P("Con datos que ya existen, medir cuántas falsas alarmas de un CGM coinciden con las alarmas de un reloj. El estudio de Mendez et al. (2026) usó 351 noches de 36 adultos con dos relojes comerciales y un CGM como referencia. Si el equipo logra acceso a datos pareados así, el cálculo es de horas de análisis y entrega la correlación que falta en las reglas 2 y 3. [[No se verificó que esos datos estén disponibles.]] Si no lo están, no existe un experimento barato que cambie el veredicto."));

  discusion.push(H2("4.5 Límites de este análisis"));
  discusion.push(B(RJ("Literatura heterogénea.") + " Los estudios usan referencias distintas (YSI, HemoCue, capilar, plasma venoso), poblaciones distintas y definiciones distintas de alarma. Solo cerca de una cuarta parte de los estudios de CGM evalúa alertas, y no hay método único (Pleus et al., 2024)."));
  discusion.push(B(RJ("Los MARD no son comparables entre referencias.") + " Unos pocos pares mueven mucho el MARD, y la exactitud de la referencia lo afecta (Kirchsteiger et al., 2015). Algunos estudios informan ARD o diferencia media y no MARD."));
  discusion.push(B(RJ("Muchas cifras son de empresas o de prensa.") + " Know Labs, DiaMonTech, RSP, Liom, Afon, Glucube, Eversense, Dexcom y Abbott. Un conflicto de interés no invalida un dato, pero exige leerlo con cuidado."));
  discusion.push(B(RJ("Cifras no verificadas.") + " La cifra de 18 min de retraso de GlucoWatch no se pudo verificar, y se usa 20 min (Poddar et al., 2008). El límite de exposición del láser viene de un manual de 2007 basado en una norma del año 2000, y la fórmula de CA no se verificó en fuente abierta. El efecto de la glucosa sobre la permitividad, de 0,01 a 0,02 % por mmol/L, viene de un resultado de búsqueda sin abrir. El −0,45 % por grado es un cálculo propio de este análisis a frecuencias bajas. La proporción de 95 % de la ISO 15197 no se confirmó. Los coeficientes de difusión de Khalil et al. (2006), base de la regla 4, vienen del resumen de un resultado de búsqueda, y en el texto abierto solo se confirmó lo cualitativo. El MARD de 11,1 % de Biolinq y el de 10,5 % de Afon aparecieron solo en fragmentos de búsqueda y no se usan."));
  discusion.push(B(RJ("Discrepancias entre fuentes.") + " El mμSORS informa 14,6 % con 230 personas y 14,5 % con 200 adultos, del mismo grupo. El artículo de Rothenbühler aparece como 2025 en línea y como 2026 en el volumen. El G7 muestra 91,3 % de alerta verdadera en el texto de un estudio y 51,0 % en su tabla, por definiciones distintas (Garg et al., 2022)."));
  discusion.push(B(RJ("Supuestos del análisis, no medidos.") + " Un episodio inducido por persona y día en el estudio de GlucoWatch, la especificidad del reloj tomada por noche, el error lento con correlación de 60 minutos, la tercera vía de 25 % de MARD, y la dependencia de 0,3 como interpolación lineal. Los resultados de alarma cambian mucho con ellos, y los casos optimista y pesimista de la tabla de rango muestran cuánto."));
  discusion.push(B(RJ("La tasa base es una mediana.") + " 0,54 eventos nocturnos por semana, con muchas personas con cero y un rango intercuartil de 0,0 a 1,5. Para una persona con más eventos, el VPP sube. Para una con cero, la alarma nunca acierta."));
  discusion.push(B(RJ("Simulación acotada.") + " 40 réplicas, semilla maestra 1, una sola curva de sangre con una hipoglucemia, y filtro con σ conocido. Verifica el cálculo y no valida un cuerpo."));
  discusion.push(B("La regla 3 supone que los errores de dos vías se interpolan linealmente entre independencia y dependencia total, un modelo simple. No hay en la literatura abierta una estimación de la correlación de errores entre modalidades."));

  // ------------------------------------------------------------------ anexo
  const anexo = [];
  anexo.push(H2("Cálculos paso a paso"));
  anexo.push(P("Los cálculos están en un script de Python 3.11 que usa numpy y el simulador del repositorio. La carpeta es pública: está en `3-analisis-de-viabilidad/` del repositorio, junto con los hallazgos con fuente y las verificaciones. Se corre desde esa carpeta con `py -3.11 calculos_dry_lab.py`, imprime los resultados y guarda `resultados-calculos.json` en la misma carpeta."));
  anexo.push(...codigo([
    "# Archivos (carpeta pública 3-analisis-de-viabilidad/ del repositorio)",
    "calculos_dry_lab.py",
    "# Salida",
    "resultados-calculos.json",
    "# Comando",
    "py -3.11 calculos_dry_lab.py",
  ]));
  anexo.push(H3("a) Tiempo de difusión"));
  anexo.push(...codigo([
    "# Formula",
    "t = L^2 / (2 D)             # tiempo para cruzar un espesor L",
    "tau_losa = 4 L^2 / (pi^2 D) # control, losa abierta por una cara",
    "# Separacion de retraso = t(epidermis hasta la capa) - t(dermis superior, 22,6 um)",
  ]));
  anexo.push(P("**Entradas.** L de epidermis viable = 56,6 µm y estrato córneo = 18,3 µm (Sandby-Møller et al., 2003). D de dermis = 2,64 × 10⁻⁶ cm²/s y D de epidermis viable = 1,0, 0,075 y 0,037 × 10⁻⁶ cm²/s (Khalil et al., 2006, piel de cadáver a 32 °C). Penetración del infrarrojo medio de unos 45 µm (Kottmann et al., 2016). Ventana de DIROS de 97,5 µm (Uluç et al., 2024)."));
  anexo.push(P("**Resultado.** Epidermis viable: " + A.filas_difusion.slice(0, 3).map((x) => f(x.t_min, 2) + " min").join(", ") + " para D de 1,0, 0,075 y 0,037 × 10⁻⁶. Dermis de 100 µm: " + f(A.filas_difusion[3].t_min, 2) + " min. Separación con toda la epidermis: " + A.separacion.map((s) => f(s.separacion_epidermis_completa_vs_dermis_min, 2)).join(", ") + " min. Separación hasta 45 µm: " + A.separacion.map((s) => f(s.separacion_45um_vs_dermis_min, 2)).join(", ") + " min. Regla 4: " + RJ("no pasa") + "."));
  anexo.push(H3("b) Fusión de valores"));
  anexo.push(...codigo([
    "sigma_f / sigma = sqrt((1 + (N - 1) rho) / N)    # limite sqrt(rho)",
    "rho = 2 r^2 - 1,  r = MARD_fusionado / promedio(MARD)   # con N = 2",
    "w = S^-1 1 / (1' S^-1 1),  var = 1 / (1' S^-1 1),  S_ij = s_i s_j rho",
  ]));
  anexo.push(P("**Entradas.** MARD de 10,1 % (redundante) frente a 11,4 y 12,0 % (3.297 pares) y frente a 9,4 con 9,6 y 9,9 % contra YSI (1.237 pares) (Sharifi et al., 2016). MARD de 14,5 % (Rothenbühler et al., 2026, Zhang et al., 2025), 20 % (Kaluza et al., 2025) y 25 % (supuesto)."));
  anexo.push(P("**Resultado.** r = " + f(Bf.rho_estimado.razon_todos, 4) + ", ρ = " + f(Bf.rho_estimado.todos_los_dias, 3) + ". Contra YSI, ρ = " + f(Bf.rho_estimado.contra_YSI_dias_4_y_7, 3) + ". GLS de 14,5, 20 y 25: " + ["0.0", "0.3", "0.5", "0.7"].map((r) => f(G[nombresG[0]][r].mard_fusionado, 2) + " % con ρ = " + r.replace(".", ",")).join(", ") + ". ρ máximo para 12 %: " + f(Bf.rho_maximo_12, 3) + ". Para 10 % no existe ρ que sirva."));
  anexo.push(H3("c) De MARD a ruido y simulación de la alarma"));
  anexo.push(...codigo([
    "sigma = MARD * glucosa / 0,798       # 0,798 = raiz(2/pi), E|X| = 0,798 sigma",
    "# Simulacion (repositorio): sangre fija, difusion tau = 6 min, ruido blanco o AR(1) de 60 min,",
    "# filtro de una profundidad (single_depth_smoother) con sigma conocido, alarma a 70 mg/dL, 40 replicas, semilla 1",
  ]));
  anexo.push(P("**Entradas.** Curva y funciones de `glucose_delay.model`, `reconstruct` y `metrics` del repositorio (Ríos Elgueta, 2026b), con los mismos parámetros del filtro de `escenarios.yaml`. σ de 5, 8, 13 y 18 mg/dL, y 25 y 35 mg/dL como extensión del análisis, para cubrir el error de Glucube (24,9 mg/dL) y de DIROS (34 a 40 mg/dL)."));
  anexo.push(P("**Resultado.** Con ruido blanco, detección de " + pc(simB.find((x) => x.sigma === 13).fraccion_detectada) + " en σ de 13 y de " + pc(simB.find((x) => x.sigma === 35).fraccion_detectada) + " en σ de 35. Con error lento, " + pc(simL.find((x) => x.sigma === 13).fraccion_detectada) + " en σ de 13 y " + pc(simL.find((x) => x.sigma === 35).fraccion_detectada) + " en σ de 35. El ruido blanco hace el cálculo optimista."));
  anexo.push(H3("d) Fusión de decisiones"));
  anexo.push(...codigo([
    "VPP = Se B / (Se B + FA),  B = 0,54 por semana",
    "OR:  Se = 1 - (1 - Se1)(1 - Se2),  FA = FA1 + FA2",
    "AND: Se = Se1 Se2,  FA = FA1 FA2 (2 w) / T,  w = 0,5 h,  T = 56 h por semana",
    "2de3: Se = Se1Se2 + Se1Se3 + Se2Se3 - 2 Se1Se2Se3,  FA = suma de FA_i FA_j (2 w) / T",
    "Dependencia rho = 0,3: Se_AND = Se1Se2 + rho (min(Se1,Se2) - Se1Se2), igual con FA",
  ]));
  anexo.push(P("**Entradas.** Tasa base de 0,54 (Mitter et al., 2025). GlucoWatch: 0,77 y 62 % de falsos positivos (Tsalikian et al., 2004b). Dexcom G7: 87,6 a 88,8 % y alerta verdadera de 82,1 a 86,9 % (Garg et al., 2022). EEG subcutáneo: 0,90 y 0,2 por semana (Snogdal et al., 2012, Blaabjerg et al., 2019). Reloj: 0,78 y especificidad de 0,64 con 66 noches de hipoglucemia de 351 (Mendez et al., 2026). EEG del oído: 0,90 y especificidad de 0,82 (Cabrera et al., 2020)."));
  anexo.push(P("**Resultado.** Vea las tablas de la sección 3.8 (fusión de decisiones). Con el diseño propuesto, óptica σ 13 con error lento Y EEG del oído: sensibilidad " + pc(filasOido[2].se) + ", VPP " + pc(filasOido[2].vpp) + " con independencia y " + pc(filasOido[3].vpp) + " con dependencia 0,3."));
  anexo.push(H3("e) Límites físicos de señal"));
  anexo.push(...codigo([
    "SNR = 2 mAU / 5 uAU = 400 por 100 mg/dL;  limite por ruido = 100 / 400 = 0,25 mg/dL",
    "sigma(+-30 mg/dL al 90 %) = 30 / 1,645 = 18,2 mg/dL",
    "sigma maximo para separar 70 de 54 (umbral a 62): 8 / 1,2816 = 6,2 (90 %), 8 / 1,6449 = 4,9 (95 %)",
    "rotacion de la brecha = 0,0056 * 16 / 10 = 0,0090 grados por mm",
    "dT = 0,889 mmol/L * (0,01 a 0,02 %/mmol/L) / 0,45 %/K = 0,02 a 0,04 K     # efecto de la glucosa sin verificar",
    "limite piel = 0,1 W/cm2 (2,6 a 1000 um) o 0,2 CA W/cm2 con CA = 10^(0,002 (lambda - 700 nm)),  area minima = P / limite",
    "sigma_ref = 15 / 1,96 = 7,65 mg/dL;  MARD de la referencia a 70 mg/dL = 0,798 * 7,65 / 70 = 8,7 %",
  ]));
  anexo.push(P("**Fuentes.** Delbeck y Heise (2021), Kottmann et al. (2012, 2016), Kaysir et al. (2023), Smith (2023), Malmberg y Maryott (1956), Auburn University Radiation Safety Office (2007), Kaluza et al. (2025), Sharif-Nia et al. (2025). Los valores sin verificar se marcaron en rojo donde aparecen."));
  anexo.push(P("**Resultado.** Los resultados están en la sección 3.6."));

  return { metodologia, resultados, discusion, anexo, referencias };
};
