<?php
/*
Plugin Name: Actilangue
Plugin URI: ---
Description:  Additionnal customization
Version: 1.0
Author: ---
Author URI: ---
Text Domain: acti
Domain Path: /languages
*/



include('pds_captcha.php');


require_once('bnp-pariba-mercanet/Mercanet.php');
require_once('lib/lib-actilangue.php');



/*******************
 *
 * Add New Role
 *
 */
add_role(
    'eleve',
    'Élève',
    array(
        'read' => true,
        'edit_published_posts' => true,
        'upload_files' => true,
        'publish_posts' => true,
        'delete_published_posts' => true,
        'edit_posts' => true,
        'delete_posts' => true
    )
);



/*******************
 *
 * Create Course
 *
 */
add_action('init', 'create_course_func');
function create_course_func()
{
    $lbl_cours = array(
        'name'               => "Les Cours",
        'singular_name'      => "Les Cours",
        'menu_name'          => "Les Cours",
        'name_admin_bar'     => "Les Cours",
        'add_new'            => "Ajouter",
        'add_new_item'       => "Ajouter",
        'new_item'           => "Ajouter",
        'edit_item'          => "Editer",
        'view_item'          => "Visualiser",
        'all_items'          => "Tous",
        'search_items'       => "Recherche",
        'parent_item_colon'  => "Parent",
        'not_found'          => "non trouvée",
        'not_found_in_trash' => "non trouvée"
    );

    $lbl_reservationq = array(
        'name'               => "Les Reservations",
        'singular_name'      => "Les Reservations",
        'menu_name'          => "Les Reservations",
        'name_admin_bar'     => "Les Reservations",
        'add_new'            => "Ajouter",
        'add_new_item'       => "Ajouter",
        'new_item'           => "Ajouter",
        'edit_item'          => "Editer",
        'view_item'          => "Visualiser",
        'all_items'          => "Tous",
        'search_items'       => "Recherche",
        'parent_item_colon'  => "Parent",
        'not_found'          => "non trouvée",
        'not_found_in_trash' => "non trouvée"
    );

    $arg_cours = array(
        'labels' => $lbl_cours,
        'public' => true,
        'show_ui' => true,
        'rewrite' => array('slug' => 'cours'),
        'capability_type' => 'post',
        'hierarchical' => false,
        'supports' => array('title', 'editor', 'thumbnail')
    );

    register_post_type('cours-actilangue', $arg_cours);


    $arg_reservation_actiq = array(
        'labels' => $lbl_reservationq,
        'public' => true,
        'show_ui' => true,
        'rewrite' => array('slug' => 'reservation-cours'),
        'capability_type' => 'post',
        'hierarchical' => false,
        'supports' => array('title')
    );

    //register_post_type('reservation_actilang', $arg_reservation_actiq);




    register_taxonomy(
        'cat-cours-actilangue',
        'cours-actilangue',
        array('hierarchical' => true, 'label' => 'Catégories de Cours', 'query_var' => true, 'rewrite' => array('slug' => 'cat-cours'))
    );
}


/*******************
 *
 * BEGIN: DIVI
 *
 */

/*******************
 *
 * Add Divi Support To CTP Course
 *
 */





function actilangue_add_post_types($post_types)
{
    $post_types[] = 'cours-actilangue';

    return $post_types;
}
add_filter('et_builder_post_types', 'actilangue_add_post_types');


/*******************
 *
 * Add Divi Custom Post Settings box
 *
 */
function actilangue_add_meta_boxes()
{
    foreach (get_post_types() as $pt) {
        if (post_type_supports($pt, 'editor') and function_exists('et_single_settings_meta_box')) {
            add_meta_box('et_settings_meta_box', __('Divi Custom Post Settings', 'Divi'), 'et_single_settings_meta_box', $pt, 'side', 'high');
        }
    }
}
add_action('add_meta_boxes', 'actilangue_add_meta_boxes');

/*******************
 *
 * Ensure Divi Builder appears in correct location
 *
 */
function actilangue_admin_js()
{
    $s = get_current_screen();
    if (!empty($s->post_type) and $s->post_type != 'page' and $s->post_type != 'post') {
?>
        <script>
            jQuery(function($) {
                $('#et_pb_layout').insertAfter($('#et_pb_main_editor_wrap'));
            });
        </script>
        <style>
            #et_pb_layout {
                margin-top: 20px;
                margin-bottom: 0px
            }
        </style>
    <?php
    }
}
add_action('admin_head', 'actilangue_admin_js');

/*******************
 *
 * Ensure that Divi Builder framework is loaded - required for some post types when using Divi Builder plugin
 *
 */
add_filter('et_divi_role_editor_page', 'actilangue_load_builder_on_all_page_types');
function actilangue_load_builder_on_all_page_types($page)
{
    return isset($_GET['page']) ? $_GET['page'] : $page;
}

/*******************
 *
 * Use Layout
 *
 */
add_filter('et_pb_show_all_layouts_built_for_post_type', 'actilangue_et_pb_show_all_layouts_built_for_post_type');
function actilangue_et_pb_show_all_layouts_built_for_post_type()
{
    return array('page', 'cours-actilangue');
}



function course_divi_metabox_func()
{
    add_meta_box(
        'id_divi_metabox', // $id
        'Paramètres de cours', // $title
        'show_course_divi_metabox_func', // $callback
        array('cours-actilangue'), // $page
        'normal', // $context
        'high'
    ); // $priority
}
add_action('add_meta_boxes', 'course_divi_metabox_func');

function show_course_divi_metabox_func()
{
    global $post;
    $settingss_o = array('editor_height' => 150);
    $editeur = Cours::getTypeEditeurText();

    $field_acti = get_post_meta($post->ID, 'field_acti', true);


    $liste_champ = array(

        array(
            "grp_name" => "Identification",
            "fields" => array(

                array(
                    "label" => "Identifiant de cours",
                    "name" => "identifiant_cours",
                    "type" => "select",
                    "description" => "Ce champs représente le cours et permet de l'identifier"
                ),

                array(
                    "label" => "Nombre de leçons",
                    "name" => "nbre_lecons_cours",
                    "type" => "text",
                    "description" => "Définit le nombre de leçons"
                )
            )
        ),
        array(
            "grp_name" => "Description",
            "fields" => array(
                array(
                    "label" => "Titre descriptif",
                    "name" => "custom_titre",
                    "type" => "editeur",
                    "description" => "Affiché dans la page de détail d'un cours avec les paragraphe"
                ),
                array(
                    "label" => "Description courte",
                    "name" => "description_courte_cours",
                    "type" => "editeur",
                    "description" => "Ce paragraphe s'affichera dans la page de détail du cours"
                ),

                array(
                    "label" => "Description - Début de cours",
                    "name" => "description_debut_cours",
                    "type" => "editeur",
                    "description" => "Ce paragraphe décrit la date de début de cours"
                )

            )
        )


    );




    ?>
    <input type="hidden" name="course_divi_metabox_nonce" value="<?php echo wp_create_nonce(basename(__FILE__)); ?>" />

    <div class="course_params">
        <div class="in_course_params">
            <div class="terne_course_params">

                <div class="et_pb_section et_pb_section_acti">
                    <div class="et-pb-section-content">

                        <div class="et-pb-options-tabs">
                            <div class="et-pb-options-tab">

                                <?php foreach ($liste_champ as $grp_champ): ?>

                                    <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                        <h3 class="et-pb-option-toggle-title"><?php echo $grp_champ['grp_name']; ?></h3>
                                        <div class="et-pb-option-toggle-content">



                                            <?php foreach ($grp_champ['fields'] as $un_champs): ?>
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label for="<?php echo $un_champs['name']; ?>"><?php echo $un_champs['label']; ?> : </label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">

                                                        <?php

                                                        if ($un_champs['type'] == 'editeur') {
                                                            if (in_array($un_champs['name'], $editeur)) {

                                                                $champ_valeur = get_post_meta($post->ID, $un_champs['name'], true);
                                                                wp_editor($champ_valeur, $un_champs['name'], $settingss_o);
                                                            }
                                                        } else {
                                                            switch ($un_champs['type']):
                                                                case 'select':
                                                        ?>
                                                                    <select id="<?php echo $un_champs['name']; ?>" name="field_acti[<?php echo $un_champs['name']; ?>]" class="regular-text">
                                                                        <option>Veuillez choisir</option>
                                                                        <?php foreach (Cours::getListeCours() as $courd_id => $cours): ?>
                                                                            <?php if ($field_acti[$un_champs['name']] == $courd_id): ?>
                                                                                <option selected value="<?php echo $courd_id; ?>"><?php echo $courd_id; ?> ==> <?php echo $cours['nom']; ?></option>
                                                                            <?php else: ?>
                                                                                <option value="<?php echo $courd_id; ?>"><?php echo $courd_id; ?> ==> <?php echo $cours['nom']; ?></option>
                                                                            <?php endif ?>
                                                                        <?php endforeach; ?>
                                                                    </select>
                                                                <?php
                                                                    break;
                                                                default:
                                                                ?><input id="<?php echo $un_champs['name']; ?>" type="text" class="regular-text" name="field_acti[<?php echo $un_champs['name']; ?>]" value="<?php echo $field_acti[$un_champs['name']]; ?>" /><?php
                                                                                                                                                                                                                                                            endswitch;
                                                                                                                                                                                                                                                        }



                                                                                                                                                                                                                                                                    ?>

                                                        <p class="description">
                                                            <?php echo $un_champs['description']; ?>
                                                        </p>
                                                    </div>
                                                </div>
                                            <?php endforeach; ?>


                                        </div>
                                    </div>

                                <?php endforeach; ?>


                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>

<?php
}


function save_course_divi_metabox_func($post_id)
{
    if (!wp_verify_nonce($_POST['course_divi_metabox_nonce'], basename(__FILE__)))
        return $post_id;

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
        return $post_id;

    if ('cours-actilangue' == $_POST['post_type']) {
        if (!current_user_can('edit_page', $post_id)) {
            return $post_id;
        } elseif (!current_user_can('edit_post', $post_id)) {
            return $post_id;
        }
    }


    update_post_meta($post_id, 'field_acti', $_POST['field_acti']);
    $editeur = Cours::getTypeEditeurText();
    foreach ($editeur as $cle) {
        update_post_meta($post_id, $cle, $_POST[$cle]);
    }
}

add_action('save_post', 'save_course_divi_metabox_func');


/*******************
 *
 * END: DIVI
 *
 */


function js_css_actilangue()
{

    global $polylang;
    $curr_lang = pll_current_language();


    wp_enqueue_style('stackable-css', plugins_url('js/stackable/stacktable.css', __FILE__));
    wp_enqueue_script('stackable-js', plugins_url('js/stackable/stacktable.js', __FILE__), array('jquery'), false, true);



    wp_enqueue_style('jquery.dataTables.min-css', plugins_url('js/datatable/jquery.dataTables.min.css', __FILE__));
    wp_enqueue_style('responsive.dataTables.min-css', plugins_url('js/datatable/responsive.dataTables.min.css', __FILE__));

    wp_enqueue_script('jquery.dataTables.min-js', plugins_url('js/datatable/jquery.dataTables.min.js', __FILE__), array('jquery'), false, true);
    wp_enqueue_script('dataTables.responsive.min-js', plugins_url('js/datatable/dataTables.responsive.min.js', __FILE__), array('jquery'), false, true);

    wp_enqueue_script('jquery-ui-timepicker-addon-jss', plugins_url('js/timepicker/jquery-ui-timepicker-addon.js', __FILE__), array('jquery-ui-core', 'jquery-ui-datepicker', 'jquery-ui-slider'));


    if ($curr_lang == 'en') {
        $curr_lang = 'en-gb';
    }

    wp_enqueue_script('jquery-ui-timepicker-addon-jss', plugins_url('js/timepicker/local/jquery-ui-timepicker-' . $curr_lang . '.js', __FILE__), array('jquery-ui-core', 'jquery-ui-datepicker', 'jquery-ui-slider'));

    wp_enqueue_style('jquery-ui-timepicker-addon-css', get_template_directory_uri() . 'js/timepicker/jquery-ui-timepicker-addon.css');


    wp_enqueue_style('popupa-css', plugins_url('css/popupa.css', __FILE__));
    wp_enqueue_style('full-cal-css', plugins_url('full-cal.css', __FILE__));
    wp_enqueue_style('jquery-ui-css-thema', '//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');

    wp_enqueue_style('acti-booking-css', plugins_url('acti-booking.css', __FILE__));

    wp_enqueue_style('sumoselect-css', plugins_url('cus_select/sumoselect.css', __FILE__));
    wp_enqueue_style('fullcalendar.min-css', plugins_url('fullcal/fullcalendar.min.css', __FILE__));

    wp_enqueue_script('moment.min-js', plugins_url('fullcal/moment.min.js', __FILE__), array('jquery'));

    wp_enqueue_script('fullcalendar.min-js', plugins_url('fullcal/fullcalendar.min.js', __FILE__), array('jquery'));
    wp_enqueue_script('locale-all-fc-js', plugins_url('fullcal/locale/' . $curr_lang . '.js', __FILE__), array('jquery'));




    wp_enqueue_script('sumoselect-js', plugins_url('cus_select/jquery.sumoselect.js', __FILE__), array('jquery'));


    wp_enqueue_script('jquery.validate.min-js', plugins_url('js/jquery.validate.min.js', __FILE__), array('jquery'));
    wp_enqueue_script('recaptcha', '//www.google.com/recaptcha/api.js', [], '1.1', true);

    wp_enqueue_script('actilangue-js', plugins_url('actilangue.js', __FILE__), array('jquery', 'jquery-ui-core', 'jquery-ui-dialog', 'jquery-ui-datepicker', 'recaptcha'));

    $env_test_client_id = get_option('env_test_client_id');
    $env_prod_client_id = get_option('env_prod_client_id');
    $env_test_ou_prod = get_option('env_test_ou_prod');

    wp_localize_script('actilangue-js', 'ajax_actilangue_object', array(
        'ajaxlurl' => admin_url('admin-ajax.php'),
        'acompte_val' => Reservation::$prix_acompte,
        'paypal_test_client_id' => $env_test_client_id,
        'paypal_prod_client_id' => $env_prod_client_id,
        'paypal_mode_test_prod' => $env_test_ou_prod
    ));
}
add_action('wp_enqueue_scripts', 'js_css_actilangue');

function js_css_actilangue_admin()
{
    wp_enqueue_script('actilangue-admin-js', plugins_url('actilangue-admin.js', __FILE__), array('jquery'));
    wp_enqueue_style('actilangue-admin-css', plugins_url('actilangue-admin.css', __FILE__));
}

add_action('admin_enqueue_scripts', 'js_css_actilangue_admin');

register_sidebar(array(
    'name' => 'Langues',
    'id' => 'la-langue',
    'description' => 'Langues',
    'before_widget' => '<div class="bef_langue">',
    'after_widget' => '</div>',
    'before_title' => '<h4 class="title_langue">',
    'after_title' => '</h4>',
));




function calendrier_acti_func($atts)
{
    global $post;
    global $polylang;
    $curr_lang = pll_current_language();


    $lendar = '';

    $msg_avant_pied_mail = get_option('msg_avant_pied_mail_' . $curr_lang);
    $msg_pied_mail = get_option('msg_pied_mail_' . $curr_lang);

    if (!session_id()) {
        session_start();
    }

    /****************************************
     *
     * 
     * Traitement de la demande de devis
     *
     */



    if ((wp_verify_nonce($_POST['actilangue_quote_nonce'], basename(__FILE__))) && (isset($_POST['actilangue_quote_nonce'])) && (pdscaptcha($_POST))) {

        $mail_html = '';



        $mail_quote_o = '';

        $quote_SimuLangue = $_SESSION['SimuLangue'];
        $quote_current_sej_DEBUT = $_SESSION['current_sej_DEBUT'];
        $quote_current_sej_FIN = $_SESSION['current_sej_FIN'];
        $quote_current_wp_course_ID = $_SESSION['current_wp_course_ID'];
        $quote_current_SimuDate = $_SESSION['current_SimuDate'];
        $quote_current_courseID = $_SESSION['current_courseID'];
        $quote_current_courseDuration = $_SESSION['current_courseDuration'];
        $quote_current_coursePrice = $_SESSION['current_coursePrice'];
        $quote_current_Logement = $_SESSION['current_Logement'];
        $quote_current_courseDetail = $_SESSION['current_courseDetail'];
        $quote_CalaDateArrivee = $_SESSION['CalaDateArrivee'];
        $quote_SimuCodePromo = $_SESSION['SimuCodePromo'];
        $quote_SimuDELF = $_SESSION['SimuDELF'];

        $quote_current_SimuCodePromo = $_SESSION['current_SimuCodePromo']; /*$obj_ws->V_Promo*/
        $quote_current_SimuDELF = $_SESSION['current_SimuDELF']; /*$obj_ws->V_DELF*/


        $quote_genre_acti = $_POST['quote_genre_acti'];
        $quote_nom_acti = $_POST['quote_nom_acti'];
        $quote_prenom_acti = $_POST['quote_prenom_acti'];
        $quote_adresse_acti = $_POST['quote_adresse_acti'];
        $quote_code_postal_acti = $_POST['quote_code_postal_acti'];
        $quote_ville_acti = $_POST['quote_ville_acti'];
        $quote_phone_acti = $_POST['quote_phone_acti'];
        $quote_email_acti = $_POST['quote_email_acti'];
        $quote_commentaires = $_POST['quote_commentaires'];

        $quote_chambre = (string)$_POST['quote_chambre'];
        $quote_pension = (string)$_POST['quote_pension'];
        $quote_petit_dejeuner = (string)$_POST['quote_petit_dejeuner'];



        $quote_adresse_acti = stripslashes($quote_adresse_acti);
        $quote_commentaires = stripslashes($quote_commentaires);


        $fcal_date_arrivee_one = $_POST['fcal_date_arrivee_one'];


        $email_entete = '
		<!DOCTYPE html>
			<html>
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

					<title>' . __('Demande de devis', 'acti') . '</title>
				</head>
				<body>

					
					<div class="wrapper" style="font-family: Times New Roman;font-size: 18px; line-height: normal;">
					<div class="in_wrapper">
							<div class="header">
								<img  style="max-width: 100%;" src="' . plugins_url('images/Logo-Actilangue.png', __FILE__) . '" />
							</div>
		';
        $email_footer = '
		<div class="avant_footer" style="background: #57a7e4;text-align: center;padding: 15px;color: white;margin-top: 50px;">
								
								<strong>ACTILANGUE</strong>

							</div>
							<div class="footer" style="text-align: center;padding-top: 50px;margin-top: 0; font-size: 14px;">
											<div class="phrase_pied">' . $msg_avant_pied_mail . '</div>

								' . $msg_pied_mail . '

							</div>
					</div>
					</div>


				</body>
		</html>
		';

        $mail_html .= '
			<div class="banniere" style="background: #57a7e4;padding: 25px;color: white;text-align: center;font-size: 18px; margin-bottom: 50px;">
				<strong>' . __('Demande de devis', 'acti') . '</strong>
			</div>		

			<div class="content_wrap">
				<div class="terne_content_wrap">';

        $mail_html .= '<div class="phrase_tete" style="text-align: center;">
							' . __('Bonjour, Votre demande de devis a été bien prise en compte', 'acti') . '
						</div>

						<div class="info_pay">
							' . __("Informations de cours", "acti") . '
						</div>
						<div class="wrapaa">
							<div class="infoa_coura" style="border: 1px solid black;padding: 15px;margin: 10px 0;font-size: 18px;">
								' . $quote_current_courseDetail . '
							</div>
						</div><br />';

        $mail_html .= '<div style="margin: 35px 0;border: 1px solid gray;">';
        $mail_html .= '<legend style="display: block; padding: 0;margin: 0;background: #f7523c;padding: 5px 15px;color: white;"><h3 style="color: white;margin: 0;padding: 0;">' . __("Coût total", "acti") . '</h3></legend>';


        $m_meta_current_coursePrice = ((float)$quote_current_coursePrice);

        $m_val_prom_percent = ((float)$quote_current_SimuCodePromo / 100);
        $m_val_prom_price = $m_meta_current_coursePrice * $m_val_prom_percent;
        $m_finale_price_promo = $m_meta_current_coursePrice - $m_val_prom_price;

        $mail_html .= '<div class="wrap_fieldset">
											<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __('Promotion', 'acti') . ': </strong></label> ' . $quote_current_SimuCodePromo . '</p>
											<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Coût total", "acti") . ': </strong></label>' . $m_finale_price_promo . ' &euro;</p>
										';
        $mail_html .= '</div>';


        $mail_html .= '</div>';


        $mail_html .= '<fieldset style="margin: 35px 0;border: 1px solid gray;">
						<legend style="display: block; padding: 0;margin: 0;background: #f7523c;padding: 5px 15px;color: white;"><h3 style="color: white;margin: 0;padding: 0;">' . __("Vos coordonnées", "acti") . '</h3></legend>
						<div class="wrap_fieldset">

							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Genre", "acti") . '</strong></label><br />
							' . $quote_genre_acti . '</p>
							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Nom", "acti") . '</strong></label><br />
							' . $quote_nom_acti . '</p>
							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Prénom", "acti") . '</strong></label><br />
							' . $quote_prenom_acti . '</p>
							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Adresse", "acti") . '</strong></label><br />
							' . $quote_adresse_acti . '</p>
							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Code postal", "acti") . '</strong></label><br />
							' . $quote_code_postal_acti . '</p>
							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Ville", "acti") . '</strong></label><br />
							' . $quote_ville_acti . '</p>
							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Téléphone", "acti") . '</strong></label><br />
							' . $quote_phone_acti . '</p>
							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("E-mail", "acti") . '</strong></label><br />
							' . $quote_email_acti . '</p>
						';

        $mail_html .= '
					</div>';
        $mail_html .= '</fieldset>';


        $mail_html .= '<fieldset style="margin: 35px 0;border: 1px solid gray;">
						<legend style="display: block; padding: 0;margin: 0;background: #f7523c;padding: 5px 15px;color: white;"><h3 style="color: white;margin: 0;padding: 0;">' . __("Logement", "acti") . '</h3></legend>
						<div class="wrap_fieldset">

							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Je souhaite habiter chez", "acti") . '</strong></label><br />
							' . Reservation::logement_lists()[$quote_current_Logement] . '</p>
							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Date de heure d'arrivée", "acti") . '</strong></label><br />
							' . $fcal_date_arrivee_one . '</p>			
						';

        $mail_html .= '
					</div>';
        $mail_html .= '</fieldset>';


        $mail_html .= '<fieldset style="margin: 35px 0;border: 1px solid gray;">
						<legend style="display: block; padding: 0;margin: 0;background: #f7523c;padding: 5px 15px;color: white;"><h3 style="color: white;margin: 0;padding: 0;">' . __("DELF", "acti") . '</h3></legend>
						<div class="wrap_fieldset">

							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("DELF", "acti") . '</strong></label><br />
							' . Reservation::yesNo()[(int)$quote_SimuDELF] . '</p>
						';

        $mail_html .= '
					</div>';
        $mail_html .= '</fieldset>';


        $mail_html .= '<fieldset style="margin: 35px 0;border: 1px solid gray;">
						<legend style="display: block; padding: 0;margin: 0;background: #f7523c;padding: 5px 15px;color: white;"><h3 style="color: white;margin: 0;padding: 0;">' . __("Commentaires", "acti") . '</h3></legend>
						<div class="wrap_fieldset">

							<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Commentaires", "acti") . '</strong></label><br />
							' . $quote_commentaires . '</p>
						';

        $mail_html .= '
					</div>';
        $mail_html .= '</fieldset>';

        $mail_html .= '</div>
			</div>

		';


        $output_quote_mail = $email_entete . $mail_html . $email_footer;


        //$mail_en_copie = get_option('admin_email');
        $mail_en_copie = 'contact@actilangue.com';

        $headers = array(
            'Content-Type: text/html; charset= " ' . get_option('blog_charset') . '"'

        );
        wp_mail($quote_email_acti, '' . __("Demande de devis", "acti"), $output_quote_mail, $headers);
        wp_mail('actilangue@kletel.net', '' . __("Demande de devis", "acti"), $output_quote_mail, $headers);
        wp_mail('contact@actilangue.com', '' . __("Demande de devis", "acti"), $output_quote_mail, $headers);

        /*$lendar.=$output_quote_mail;*/



        $lendar .= '
		<div id="dialog-message" class="for_devis" title="' . __("Demande de devis", "acti") . '">
		' . __('Nous avons reçu votre demande de devis.', 'acti') . '<br/>
		' . __('Un email vous sera envoyé,', 'acti') . '<br/>
		' . __('Veuillez vérifier également votre boîte spam,', 'acti') . '
		</div>
		';
    }


    /****************************************
     *
     * 
     * Form calendar
     *
     */
    $cours_slug = '';
    $cours_id = '';
    $cours_label = '';
    $cours_existe = 0;
    $classe_hide_isnt_simple_page = 'height: 0; overflow: hidden; margin: 0;';
    $nom_classss = '';

    $simple_page = 0;
    $simple_devis = 0;

    $identifiant_cours = '';
    $nbre_lecons_cours = '';
    $description_debut_cours = '';

    $field_acti = array();

    /**********************************
     *
     * We are not in single product
     * 
     *
     */
    if ((int)$atts['simple_page'] == 1) {
        $cours_existe = 1;
        $classe_hide_isnt_simple_page = '';
        $simple_page = 1;
        $nom_classss = 'this_is_simple_page';

        if ((int)$atts['simple_devis'] == 1) {
            $nom_classss = 'this_is_simple_page with_simple_devis';
            $simple_devis = 1;
        }
    } else {
        $simple_page = 0;
        $field_acti = get_post_meta($post->ID, 'field_acti', true);

        $identifiant_cours = $field_acti['identifiant_cours'];
        $nbre_lecons_cours = $field_acti['nbre_lecons_cours'];
        $description_debut_cours = get_post_meta($post->ID, 'description_debut_cours', true);


        if ((isset($identifiant_cours)) && ($identifiant_cours != '')) {
            $cours_slug = strtoupper($identifiant_cours);
            /*$cours_id = Cours::getListeCours()[ $cours_slug ]['id'];*/
            $cours_id = $identifiant_cours;
            $cours_label = $post->post_title;
            $cours_existe = 1;
        }
    }


    $lendar .= '
			<div class="ve_full_cala" style="display: none;">
					<div class="terne_ve_full_cala">
						<div class="on_ve_full_cala"><div class="ferme_popup">X</div>

							<div class="b_on_ve_full_cala b_on_ve_full_cala_haut">
								<div class="sume_date_sejoura">
									<div class="in_sume_date_sejoura">
										<h4>' . __("Veuillez choisir une date", "acti") . '</h4>
									</div>
								</div>
							</div>

							<div class="h_on_ve_full_cala">
								<div id="actilangue_cal"></div>
							</div>

							<div class="b_on_ve_full_cala">
								<div class="sume_date_sejoura">
									<div class="in_sume_date_sejoura">
										<h3>' . __("Début du cours,<br>correspondant à votre choix de date", "acti") . '</h3>
										

										<div class="sej_sume_date_sejoura">
											<div class="terne_sej_sume_date_sejoura">
												<span class="voyan">' . __("Du", "acti") . '</span> <span class="cala_date cala_debut">-</span> <span class="voyan">' . __("Au", "acti") . '</span> <span class="cala_fin cala_date">-</span>
											</div>
										</div>

									</div>
								</div>
							</div>			



						</div>
					</div>
			</div>

';

    $lendar .= '
<div class="acti_registration_wrap">
	<div class="in_acti_registration_wrap">
		<div class="terne_acti_registration_wrap">




			<div class="acti_cal_form_wrap">
				<div class="in_acti_cal_form_wrap">
					<div class="terne_acti_cal_form_wrap">';


    if ($cours_existe == 1):

        global $polylang;
        /*****************
         * Page Fr Registration ID
         */
        $curr_lang = pll_current_language();
        $id_PAGE_FR = 1191;
        $translationIds = $polylang->model->get_translations('post', $id_PAGE_FR);
        $id_page_translated = pll_get_post($id_PAGE_FR, pll_current_language());

        $lien_formulaire  = get_permalink($id_page_translated);

        /*******************************
         * We are in request quote page
         */
        $pejy_devis = get_option("pejy_devis");


        $class_forma = '';
        if ($simple_devis == 1) {
            $devis_id_PAGE_FR = (int)$pejy_devis;
            $devis_translationIds = $polylang->model->get_translations('post', $devis_id_PAGE_FR);
            $devis_id_page_translated = pll_get_post($devis_id_PAGE_FR, pll_current_language());


            $lien_formulaire  = get_permalink($devis_id_page_translated);
            $class_forma = 'form_devia_quote';
        }




        $lendar .= '

						<form id="obj_form_acti_sign" method="post" class="form_acti_sign with_msgggg ' . $class_forma . '" action="' . $lien_formulaire . '">

						<input type="hidden" name="current_langue" id="current_langue" value="' . strtoupper($curr_lang) . '" />
						<input type="hidden" name="wp_course_ID" id="wp_course_ID" value="' . $post->ID . '" />

							';



        $lendar .= '
							<div class="nw_wrap_caal">
<h3 id="lbl_nom_cours" class="forma_titra">';
        if ($simple_page == 0) {
            $lendar .= $cours_label;
        }

        $lendar .= '</h3>

							
								<div class="terne_nw_wrap_caal">';



        $lendar .= '<div class="l_nw_wrap_caal">
										<div class="in_l_nw_wrap_caal">
											<div class="terne_l_nw_wrap_caal">';

        $lendar .= '<div class="acti_erreur_container">
												<div class="in_acti_erreur_container">
													<div class="intro_msg_erreur">
														<div class="forma_un_erreur">' . __('Une erreur a été trouvée dans votre formulaire', 'acti') . '</div>
														<div class="forma_plusieurs_erreur">' . __('Des erreurs ont été trouvées dans votre formulaire', 'acti') . '</div>
													</div>
													<div class="contenu_msg_erreur"><ul></ul></div>
												</div>
												</div>';

        if ($simple_devis == 1) {
            $lendar .= '
	<div class="wrap_title_coura">
		<div class="in_wrap_title_coura">
			<h3>' . __('Informations de cours', 'acti') . '</h3>
		</div>
	</div>
	';
        }

        if ($simple_page == 1) {


            $lendar .= '
		<div class="lbl_fcalend">
			' . __("Quel est votre niveau ?", "acti") . '
		</div>';
        }


        $lendar .= '<div class="acti_txt_field ' . $nom_classss . '" style="' . $classe_hide_isnt_simple_page . '">
								<div class="in_acti_txt_field">
									<div class="terne_acti_txt_field">
										


										<select id="fcal_SimuCours_acti" class="fcal_SimuCours selekitabox">';

        if ($simple_page == 1) {
            /*************************************************
             *
             *
             * Get course list if we are un simple page
             *
             *********/
            $nbre_course = 0;
            foreach (Cours::getListeCours() as $num => $un_cours):

                if ($nbre_course == 0) {
                    $selectar = 'selected = selected';
                } else {
                    $selectar = '';
                }
                $lendar .= '<option ' . $selectar . ' data-corres_wp_postid="' . getWPCoursByKeyword($un_cours['id']) . '" value="' . $un_cours['id'] . '">' . $un_cours['nom'] . '</option>';
                $nbre_course++;
            endforeach;
        } else {
            /*************************************************
             *
             *
             * We are in single course, get current course id
             *
             *********/
            $lendar .= '<option selected data-corres_wp_postid="' . getWPCoursByKeyword($cours_id) . '" value="' . $cours_id . '">' . $cours_label . '</option>';
        }
        $lendar .= '</select>

									</div>
								</div>
							</div>


							<div class="lbl_fcalend">
								' . __("Nombre de semaines", "acti") . '
							</div>
							<div class="acti_txt_field">
								<div class="in_acti_txt_field">
									<div class="terne_acti_txt_field">

										<select id="fcal_SimuDuree_acti" class="fcal_SimuDuree selekitabox">';


        $nbre_sem = 0;

        foreach (Cours::getListeSemaines() as $vale_semaine):
            $selected_option = "";
            if ($nbre_sem == '0') {
                $lendar .= '<option value="' . $vale_semaine . '" ' . $selected_option . '>' . $vale_semaine . ' ' . __("semaine", "acti") . '</option>';
            } else {
                if ($nbre_sem == 1 /*&& $simple_devis != 1*/) {
                    $selected_option = ' selected="selected"';
                }

                $lendar .= '<option value="' . $vale_semaine . '" ' . $selected_option . '>' . $vale_semaine . ' ' . __("semaines", "acti") . '</option>';
            }

            $nbre_sem++;
        endforeach;
        $lendar .= '</select>

										<input type="hidden" id="fcal_last_date_chosen"/>
										<input type="hidden" id="fcal_debut" />
										<input type="hidden" id="fcal_fin" />

									</div>
								</div>
							</div>


							<div class="lbl_fcalend autorisepo_cal">
								' . __("Début du cours", "acti") . '<div class="change_date_coura">(' . __("cliquer pour faire un autre choix de date", "acti") . ')</div>
							</div>

							<div class="acti_txt_field">
								<div class="in_acti_txt_field">
									<div class="terne_acti_txt_field">

										<div class="like_an_input">
											<div class="terne_like_an_input">
												<div class="terne_sej_sume_date_sejoura">
													<span class="voyan">' . __("Du", "acti") . '</span> <span class="cala_date cala_debut">-</span> <span class="voyan">' . __("Au", "acti") . '</span> <span class="cala_fin cala_date">-</span>
												</div>
											</div>
										</div>

									</div>
								</div>
							</div>	
							';
        /*
*
* Begin Logement in Devis
*
*/



        $lendar .= '<div class="lbl_fcalend">
								' . __("DELF", "acti") . '
							</div>

							<div class="cal_wrapa_radio cal_wrapa_radio_delf">
								<div class="in_cal_wrapa_radio">
									<div class="terne_cal_wrapa_radio">

										<div class="wrapa_radio">
														<div class="acti_radios">
																	<label class="wrap_radio_acti">
																      <input type="radio" checked="" name="delf_acti_cal" value="0"> <span class="hre_the_btn_cus">&nbsp;</span> <span class="hre_the_lbl_cus">' . __("Non", "acti") . '</span>
																    </label>
																
																	<label class="wrap_radio_acti">
																      <input type="radio" name="delf_acti_cal" value="1"> <span class="hre_the_btn_cus">&nbsp;</span> <span class="hre_the_lbl_cus">' . __("Oui", "acti") . '</span>
																    </label>																
														</div>
												</div>
									</div>
								</div>
							</div>';

        if ($simple_devis == 1) {

            /*
<div class="titre_user_infoa titre_user_infoaaaaa">
													<h3>'.__("Logement", "acti").'</h3>
												</div>
										*/
            $lendar .= '

										<div class="user_infoa">
											<div class="in_user_infoa">

												

												<div class="contenu_user_infoa">
													<div class="in_contenu_user_infoa">	
										';
        }



        if ($simple_devis == 1) {
            $lendar .= '<div class="wrap_user_infoa" style="width: 100%;">';
        }

        $lendar .= '<div class="lbl_fcalend">
								' . __("Date de heure d'arrivée", "acti") . '
							</div>

							<div class="acti_txt_field">
								<div class="in_acti_txt_field">
									<div class="terne_acti_txt_field">

										<input autocomplete="off" id="fcal_date_arrivee_one_acti" type="text" class="fcal_date_arrivee_one acti_datetime_picker" name="fcal_date_arrivee_one">

									</div>
								</div>
							</div>';

        if ($simple_devis == 1) {
            $lendar .= '</div>';
        }

        if ($simple_devis == 1) {
            $lendar .= '<div class="wrap_user_infoa" style="width: 100%;">';
        }
        $lendar .= '
													<div class="lbl_fcalend">
														' . __("Je souhaite habiter chez", "acti") . '
													</div>
													<div class="acti_txt_field">
														<div class="in_acti_txt_field">
															<div class="terne_acti_txt_field">

																<select id="fcal_Logement_page_one_acti" name="fcal_Logement_page_one" class="fcal_Logement_page_one selekitabox">';
        foreach (Reservation::logement_lists() as $cle_log => $txt_log):
            $lendar .= '<option value="' . $cle_log . '">' . $txt_log . '</option>';
        endforeach;
        $lendar .= '</select>

															</div>
														</div>
													</div>';
        if ($simple_devis == 1) {
            $lendar .= '</div>';
        }

        if ($simple_devis == 1) {

            /*$lendar .= '
												<div class="wrap_user_infoa">
													<div class="lbl_fcalend">
														'.__("Chambre", "acti").'
													</div>
													<div class="acti_txt_field">
														<div class="in_acti_txt_field">
															<div class="terne_acti_txt_field">
																<select id="quote_chambre" name="quote_chambre" class="fcal_Logement_page_one selekitabox">';
																	foreach( Reservation::single_double() as $cle_log => $txt_log ): 
																		$lendar .= '<option value="'.$cle_log.'">'.$txt_log.'</option>';
																	endforeach;	
																$lendar .= '
																</select>
															</div>
														</div>
													</div>
												</div>
											';

											$lendar .= '
												<div class="wrap_user_infoa">
													<div class="lbl_fcalend">
														'.__("Pension", "acti").'
													</div>
													<div class="acti_txt_field">
														<div class="in_acti_txt_field">
															<div class="terne_acti_txt_field">
																<select id="quote_pension" name="quote_pension" class="fcal_Logement_page_one selekitabox">';
																	foreach( Reservation::demi_pension_pension_complete() as $cle_log => $txt_log ): 
																		$lendar .= '<option value="'.$cle_log.'">'.$txt_log.'</option>';
																	endforeach;	
																$lendar .= '
																</select>
															</div>
														</div>
													</div>
												</div>
											';

											$lendar .= '
												<div class="wrap_user_infoa">
													<div class="lbl_fcalend">
														'.__("Petit déjeuner", "acti").'
													</div>
													<div class="acti_txt_field">
														<div class="in_acti_txt_field">
															<div class="terne_acti_txt_field">
																<select id="quote_petit_dejeuner" name="quote_petit_dejeuner" class="fcal_Logement_page_one selekitabox">';
																	foreach( Reservation::petit_dejeuner_list() as $cle_log => $txt_log ): 
																		$lendar .= '<option value="'.$cle_log.'">'.$txt_log.'</option>';
																	endforeach;	
																$lendar .= '
																</select>
															</div>
														</div>
													</div>
												</div>
											';*/


            $lendar .= '

														</div>
													</div>

												</div>
											</div>
											';
        }


        /*
*
* End Logement in Devis
*
*/





        if ($simple_devis == 1) {
            /*$lendar .= '
	<div class="titre_user_infoa">
		<h3>'.__("Code promotion", "acti").'</h3>
	</div>';*/

            $lendar .= '
	<div class="lbl_fcalend">
		' . __("Code promotion", "acti") . '
	</div>';
        } else {
            $lendar .= '
	<div class="lbl_fcalend">
		' . __("Code promotion", "acti") . '
	</div>';
        }

        $lendar .= '



							<div class="wrap_promo_coda">
								<div class="in_wrap_promo_coda">
									<div class="terne_wrap_promo_coda">

										<input type="text" id="code-promo-acti" name="code-promo-acti" value="" />

										<a id="test_codeprom" href="#">OK</a>

									</div>

									
								</div>
							</div>

							';




        if ($simple_devis == 1) {
            $arr_champ_quote = array(
                array(
                    'label' => __("Genre", "acti"),
                    'slug' => 'quote_genre_acti',
                    'type' => 'select',
                    'options' => array(
                        __("Masculin", "acti") => __("Masculin", "acti"),
                        __("Feminin", "acti") => __("Feminin", "acti")
                    ),
                    'class' => ''
                ),
                array(
                    'label' => __("Nom", "acti"),
                    'slug' => 'quote_nom_acti',
                    'type' => 'text',
                    'class' => ''
                ),
                array(
                    'label' => __("Prénom", "acti"),
                    'slug' => 'quote_prenom_acti',
                    'type' => 'text',
                    'class' => ''
                ),
                array(
                    'label' => __("Adresse", "acti"),
                    'slug' => 'quote_adresse_acti',
                    'type' => 'text',
                    'class' => ''
                ),
                array(
                    'label' => __("Code postal", "acti"),
                    'slug' => 'quote_code_postal_acti',
                    'type' => 'text',
                    'class' => ''
                ),
                array(
                    'label' => __("Ville", "acti"),
                    'slug' => 'quote_ville_acti',
                    'type' => 'text',
                    'class' => ''
                ),
                array(
                    'label' => __("Téléphone", "acti"),
                    'slug' => 'quote_phone_acti',
                    'type' => 'text',
                    'class' => ''
                ),
                array(
                    'label' => __("E-mail", "acti"),
                    'slug' => 'quote_email_acti',
                    'type' => 'email',
                    'class' => ''
                ),
                array(
                    'label' => __("Commentaires", "acti"),
                    'slug' => 'quote_commentaires',
                    'type' => 'textarea',
                    'class' => ''
                )
            );

            $lendar .= '
								<div class="user_infoa">
									<div class="in_user_infoa">
										<div class="titre_user_infoa">
											<h3>' . __("Vos coordonnées", "acti") . '</h3>
										</div>

										<div class="contenu_user_infoa">
											<div class="in_contenu_user_infoa">';

            foreach ($arr_champ_quote as $champ) {
                $lendar .= '

													<div class="wrap_user_infoa wrap_user_infoa_' . $champ["slug"] . '">



													';

                if (($champ['slug'] == 'quote_nom_acti') || ($champ['slug'] == 'quote_email_acti')) {
                    $lendar .= '<div class="lbl_fcalend">' . $champ['label'] . ' *</div>';
                } else {
                    $lendar .= '<div class="lbl_fcalend">' . $champ['label'] . '</div>';
                }


                switch ($champ['type']):
                    case 'select':
                        $lendar .= '
															<div class="acti_txt_field">
																	<div class="in_acti_txt_field">
																		<div class="terne_acti_txt_field">
																			<select id="' . $champ["slug"] . '" name="' . $champ["slug"] . '" class="selekitabox">
																				';
                        foreach ($champ['options'] as $cle_sel => $val_sel) {
                            $lendar .= '<option value="' . $cle_sel . '">' . $val_sel . '</option>';
                        }
                        $lendar .= '
																			</select>
																		</div>
																	</div>
																</div>';
                        break;

                    case 'textarea':
                        $lendar .= '
															<div class="acti_txt_field">
																	<div class="in_acti_txt_field">
																		<div class="terne_acti_txt_field">
																			<textarea id="' . $champ["slug"] . '" name="' . $champ["slug"] . '" class="' . $champ["class"] . '"></textarea>																			
																		</div>
																	</div>
																</div>';
                        break;

                    default:
                        $lendar .= '
														<div class="acti_txt_field">
																<div class="in_acti_txt_field">
																	<div class="terne_acti_txt_field">
																		<input id="' . $champ["slug"] . '" type="' . $champ["type"] . '" class="' . $champ["class"] . '" name="' . $champ["slug"] . '" />
																	</div>
																</div>
															</div>';
                endswitch;


                $lendar .= '</div>';
            }




            $lendar .= '</div>
										</div>
										

									</div>
								</div>
								<h3></h3>
							';
        }



        $lendar .= '



<div class="btn_inscrs_wrap">
								<div class="in_btn_inscrs_wrap">
									<div class="terne_btn_inscrs_wrap">';
        // $lendar .= '
        // <div class="recaptcha">
        // 	<div class="g-recaptcha" data-sitekey="6LfBe4IhAAAAAF4FSpnrVatabSNpQervfYPSDTdJ"></div>
        // </div>';


        if ((int)$simple_devis == 0) {
            $lendar .= '<button id="goto_inscription" type="submit">' . __("Continuer", "acti") . ' <span class="pricea_btn">' . Reservation::$prix_acompte . ' ' . __("Euros", "acti") . '</span></button>';
        } else {
            $lendar .= pdscaptcha("question");
            $lendar .= '<button id="goto_inscription" type="submit">' . __("Demande de devis", "acti") . '</button>';
        }

        $lendar .= '
									</div>
								</div>
							</div>';


        if ((int)$simple_devis == 0) {
            $lendar .= '<div class="acti_place_dispo">
								<div class="in_acti_place_dispo">
									<div class="terne_acti_place_dispo">
										<span class="lbl_acti_place_rest">' . __("Place(s) disponibles", "acti") . ' :</span> <span id="nbre_place_restant" class="acti_place_rest">---</span>
									</div>
								</div>
							</div>';
        }



        $lendar .= '
											</div>
										</div>
									</div>';




        $lendar .= '<div class="r_nw_wrap_caal">
										<div class="in_r_nw_wrap_caal">
											<div class="terne_r_nw_wrap_caal">';

        /*<div id="lbl_code_promo" class="desc_coura">'.__("Promotion", "acti").': <span id="val_code_promo">-</span> </div>*/
        global $polylang;
        $curr_lang_custom = pll_current_language();

        $array_langue_custom = array(
            'fr' => '<p class="halt">ATTENTION !<br />Cours No 1, No 2, No 3 ou Programme Junior - Durée minimum du cours 2 semaines.<br />Cours Combinés C25, C30 et Cours Particuliers EI20, EI25, EI30, EI40, EI50 = à partir d’une semaine.</p>',
            'en' => '<p class="halt">ATTENTION!<br />Course No 1, No 2, No 3 or Junior Program - Minimum course length of 2 weeks.<br />Combined courses C25, C30 and Private lessons EI20, EI25, EI30, EI40, EI50 = from one week.</p>',
            'de' => '<p class="halt">ACHTUNG!<br />Kurs Nr. 1, Nr. 2, Nr. 3 oder Junior-Programm - Mindestkursdauer 2 Wochen.<br />Kombinierte Kurse C25, C30 und Privatunterricht EI20, EI25, EI30, EI40, EI50 = ab einer Woche.</p>',
            'it' => '<p class="halt">ATTENZIONE !<br />Corso n° 1, n° 2, n° 3 o programma junior - Durata minima del corso 2 settimane.<br />Corsi combinati C25, C30 e lezioni private EI20, EI25, EI30, EI40, EI50 = da una settimana.</p>',
            'es' => '<p class="halt">ATENCIÓN !<br />Curso No 1, No 2, No 3 o Programa Junior - Duración mínima del curso: 2 semanas.<br />Cursos combinados C25, C30 y clases privadas EI20, EI25, EI30, EI40, EI50 = desde una semana.</p>'
        );
        $halt_html = $array_langue_custom[$curr_lang_custom];
        $lendar .= '

<div class="recap_acompte">
					<div class="in_recap_acompte">
						<div class="terne_recap_acompte">

							<div class="wrap_acompte">
								<span class="lbl_acompte">' . __("Acompte à régler", "acti") . ' : </span><span class="val_lbl_acompte">' . Reservation::$prix_acompte . '</span> €
							</div>
							
							<div class="wrap_cout_total">
								<span class="cout_total">' . __("Coût total", "acti") . ' : </span><span id="cout_total_sapn">---</span> €
							</div>

							<div id="lbl_nbre_lecon" class="desc_coura">' . $nbre_lecons_cours . '</div>
							
							

						</div>
					</div>
				</div>




							<div class="arrow_b_acti">
								<div class="in_arrow_b_acti">
									<div class="terne_arrow_b_acti">
										
									</div>
								</div>
							</div>

							
<div class="acti_booking_metas">' . $halt_html . '

					<div class="in_acti_booking_metas">
						
							
							<div id="generated_meta">
								
							</div>
							<div class="chosen_semaine">
								
							</div>

						
					</div>
				</div>';

        global $polylang;
        $curr_lang = pll_current_language();

        $arra_semain = array(
            'fr' => 'semaine/s',
            'en' => 'week/s',
            'de' => 'Woche/n',
            'it' => 'settimana/e',
            'es' => 'semana/s'
        );


        $lendar .= '<div class="cacla_semaine">
					<div class="terne_cacla_semaine">
						<span id="semaine_val_cala"></span> ' . $arra_semain[$curr_lang] . '
					</div>
				</div>';





        $lendar .= '
											</div>
										</div>
									</div>';




        $lendar .= '
								</div>';

        $lendar .= '

				<div class="wrap_consigne_actia">
						<div class="consigne_actia">
								<div class="in_consigne_actia">
									<div class="terne_consigne_actia">
										<div class="icona_infoa"></div>
										<div id="lbl_description_cours" class="descriptio_demande descriptio_demandeaaaaaaa">
											' . $description_debut_cours . '
										</div>
										

									</div>
								</div>
							</div>
				</div>

											';

        $lendar .= '
							</div>
						';

        if ($simple_devis == 1) {

            $lendar .= '<input type="hidden" name="actilangue_quote_nonce" value="' . wp_create_nonce(basename(__FILE__)) . '" />';
        }



        $lendar .= '</form>';

    else:
        $lendar .= __("Informations de cours, à mettre", "acti");
    endif;

    $lendar .= '
					</div>
				</div>
			</div>

		</div>
	</div>
</div>
';

    return $lendar;
}

//add_shortcode( 'calendrier', 'calendrier_acti_func' );

function put_cal_in_header_func()
{
?>
    <script type="text/javascript">
        jQuery(document).ready(function($) {
            try {
                $('body').prepend($('.ve_full_cala'));
            } catch (e) {
                var b;
                b = "";
            }

        });
    </script>
<?php
}
add_action('wp_footer', 'put_cal_in_header_func');


function booking_header_func($atts)
{
    if (!session_id()) {
        session_start();
    }
    global $post;
    $lendar = '';
    $lendar .= '

	<div class="head_booking_actilang">
		<div class="in_head_booking_actilang">
			<div class="terne_head_booking_actilang">';




    if ((isset($_SESSION['current_courseID'])) && ($_SESSION['current_courseID'] != "") && ($_SESSION['current_courseID'])):

        $lendar .= '<h1>' . Cours::getListeCours()[$_SESSION['current_courseID']]['nom'] . '</h1>';

    else:
        $lendar .= '<h1>' . $post->post_title . '</h1>';
    endif;

    $lendar .= '
			</div>
		</div>
	</div>
';

    $lendar .= '
	<div class="bread_booking_actilang">
		<div class="in_bread_booking_actilang">
			<div class="terne_bread_booking_actilang">';

    foreach (Reservation::etapes() as $step_key => $step_val) {
        $lendar .= '<div id="step_' . $step_key . '" class="acti_steps ' . $step_val['class'] . '">

					<div class="in_acti_steps">

						<div class="step_bg">' . $step_val['text'] . '</div>
						<div class="step_arrrow"></div>

					</div>

				</div>';
    }

    $lendar .= '</div>
		</div>
	</div>
';

    return $lendar;
}

//add_shortcode( 'booking_header', 'booking_header_func' );


function booking_forma_func($atts)
{
    global $polylang;
    $curr_lang = pll_current_language();

    $msg_virement_bc = get_option('msg_virement_bc_' . $curr_lang);
    $msg_mandat_cash = get_option('msg_mandat_cash_' . $curr_lang);
    $msg_bonjour = get_option('msg_bonjour_' . $curr_lang);
    $msg_titre_mail = get_option('msg_titre_mail_' . $curr_lang);

    $msg_avant_pied_mail = get_option('msg_avant_pied_mail_' . $curr_lang);
    $msg_pied_mail = get_option('msg_pied_mail_' . $curr_lang);


    $insc_msg_titre_mail = get_option('insc_msg_titre_mail_' . $curr_lang);
    $insc_msg_mail = get_option('insc_msg_mail_' . $curr_lang);
    $msg_popa_reservation = get_option('msg_popa_reservation_' . $curr_lang);





    /****************************************
     *
     * 
     * Mercanet
     *
     */

    $bnp_paribas_cle_secrete = get_option('bnp_paribas_cle_secrete');
    $bnp_paribas_merchant_id = get_option('bnp_paribas_merchant_id');
    $bnp_paribas_mode = get_option('bnp_paribas_mode');

    $paymentResponse = new Mercanet($bnp_paribas_cle_secrete);

    if ((isset($_POST['Data'])) && (isset($_POST['Data']) != "")) {
        $paymentResponse->setResponse($_POST);
    }


    if (

        (wp_verify_nonce($_POST['actilangue_booking_nonce'], basename(__FILE__))) && (isset($_POST['actilangue_booking_nonce'])) ||

        ($paymentResponse->isValid() && $paymentResponse->isSuccessful())

    ) {



        /****************************************
         *
         * Process
         * Send Email Confirmation after paiement
         *
         */

        $lendar = '';

        $etat_reservation = '';

        $data_form = array();
        $client_email = '';

        $current_wp_course_ID = 0;
        $current_sej_DEBUT = '';
        $current_sej_FIN = '';

        $id_current_course_ACTI = '';
        $current_courseDuration = '';
        $current_coursePrice = '';
        $gen_course_detail = '';
        $methode_de_payement = '';

        $data_current_SimuDELF = '';
        $data_current_SimuCodePromo = '';

        if ((wp_verify_nonce($_POST['actilangue_booking_nonce'], basename(__FILE__))) && (isset($_POST['actilangue_booking_nonce']))) {
            $data_form = $_POST['acti_form'];
            $data_form['current_wp_course_ID'] = $_POST['current_wp_course_ID'];
            $data_form['current_sej_DEBUT'] = $_POST['current_sej_DEBUT'];
            $data_form['current_sej_FIN'] = $_POST['current_sej_FIN'];
            $data_form['current_SimuDate'] = $_POST['current_SimuDate'];
            $data_form['id_current_course_ACTI'] = $_POST['id_current_course_ACTI'];
            $data_form['current_courseDuration'] = $_POST['current_courseDuration'];
            $data_form['current_coursePrice'] = $_POST['current_coursePrice'];
            $data_form['current_Logement'] = $_POST['current_Logement'];
            $data_form['gen_course_detail'] = $_POST['gen_course_detail'];

            $data_form['acti_form_email'] = $_POST['acti_form_email'];
            $data_form['methode_de_payement'] = $_POST['methode_de_payement'];




            $client_email = $_POST['acti_form_email'];

            $current_wp_course_ID = $_POST['current_wp_course_ID'];
            $current_sej_DEBUT = $_POST['current_sej_DEBUT'];
            $current_sej_FIN = $_POST['current_sej_FIN'];

            $id_current_course_ACTI = $_POST['id_current_course_ACTI'];
            $current_courseDuration = $_POST['current_courseDuration'];
            $current_coursePrice = $_POST['current_coursePrice'];
            $gen_course_detail = $_POST['gen_course_detail'];
            $methode_de_payement = $_POST['methode_de_payement'];

            $data_current_SimuDELF = $_POST['current_SimuDELF'];
            $data_current_SimuCodePromo = $_POST['current_SimuCodePromo'];
        } else {

            /****************************************
             *
             * D: Process
             * BNP PARIBA validation
             *
             */


            $bnp_transaction_ref = '';

            if ((isset($_POST['Data'])) && (isset($_POST['Data']) != "")) {
                if ($paymentResponse->isValid() && $paymentResponse->isSuccessful()) {
                    /****************************************
                     *
                     * BNP PARIBA Mercanet - Success
                     *
                     */
                    $les_datas = $_POST['Data'];
                    $str_filtre = str_replace("|", "&", $les_datas);
                    parse_str($str_filtre, $tableau_data);


                    $bnp_wp_data = get_option($tableau_data['transactionReference']);

                    //$bnp_wp_data = get_option( 'tempa_var' );



                    /*$lendar .= '<pre>PRINT R1: '.print_r($bnp_wp_data, true).'</pre>';
				 		$lendar .= '<pre>PRINT R2: '.print_r($tableau_data, true).'</pre>';*/


                    $etat_reservation = 'acompte-paye';
                    $data_form = $bnp_wp_data;
                    $client_email = $bnp_wp_data['acti_form_email'];

                    $current_wp_course_ID = $bnp_wp_data['current_wp_course_ID'];
                    $current_sej_DEBUT = $bnp_wp_data['current_sej_DEBUT'];
                    $current_sej_FIN = $bnp_wp_data['current_sej_FIN'];

                    $id_current_course_ACTI = $bnp_wp_data['id_current_course_ACTI'];
                    $current_courseDuration = $bnp_wp_data['current_courseDuration'];
                    $current_coursePrice = $bnp_wp_data['current_coursePrice'];
                    $gen_course_detail = $bnp_wp_data['gen_course_detail'];
                    $methode_de_payement = $bnp_wp_data['methode_de_payement'];

                    $bnp_transaction_ref = $tableau_data['transactionReference'];


                    $data_current_SimuDELF = $tableau_data['current_SimuDELF'];
                    $data_current_SimuCodePromo = $tableau_data['current_SimuCodePromo'];
                }
            }

            /****************************************
             *
             * F: Process
             * BNP PARIBA validation
             *
             */
        }





        $random_password = wp_generate_password();



        //$mail_en_copie = get_option('admin_email');
        $mail_en_copie = 'contact@actilangue.com';

        $sujet = __("Confirmation de réservation de cours", "acti");

        $mail_html = '';



        $email_entete = '
<!DOCTYPE html>
	<html>
		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

			<title>' . $msg_titre_mail . '</title>
		</head>
		<body>

			
			<div class="wrapper" style="font-family: Times New Roman;font-size: 18px; line-height: normal;">
			<div class="in_wrapper">
					<div class="header">
						<img  style="max-width: 100%;" src="' . plugins_url('images/Logo-Actilangue.png', __FILE__) . '" />
					</div>
';
        $email_footer = '
<div class="avant_footer" style="background: #57a7e4;text-align: center;padding: 15px;color: white;margin-top: 50px;">
						
						<strong>ACTILANGUE</strong>

					</div>
					<div class="footer" style="text-align: center;padding-top: 50px;margin-top: 0; font-size: 14px;">
									<div class="phrase_pied">' . $msg_avant_pied_mail . '</div>

						' . $msg_pied_mail . '

					</div>
			</div>
			</div>


		</body>
</html>

';



        $mail_html .= '
	

					<div class="banniere" style="background: #57a7e4;padding: 25px;color: white;text-align: center;font-size: 18px; margin-bottom: 50px;">
						<strong>' . $msg_titre_mail . '</strong>
					</div>			

					<div class="content_wrap">
						<div class="terne_content_wrap">
							
							<div class="phrase_tete" style="text-align: center;">
								' . $msg_bonjour . '
							</div>

							


							<div class="info_pay">

								<h3 class="titre_info_pa">' . __("Informations de cours", "acti") . '</h3> 

<div class="wrapaa">
	<div class="infoa_coura" style="border: 1px solid black;padding: 15px;margin: 10px 0;font-size: 18px;">
		' . $gen_course_detail . '
	</div>
										
								</div>

								<br />
						


								<h3 class="titre_info_pa">' . __("Informations de paiement", "acti") . '</h3> 


								<div class="wrapaa">
									<strong class="derline">Méthode de paiement:</strong><br/>
									<div>' . Reservation::pay_methods()['lists'][$methode_de_payement] . '</div>
								</div>

								';

        if ($methode_de_payement != 'mandat-cash') {
            $mail_html .= '<div class="wrapaa">
										<strong class="derline">Montant de l\'acompte:</strong><br/>
										<div class="montant">' . Reservation::$prix_acompte . ' €</div>
									</div>';
        }





        /****************************************
         *
         * Methode de paiement
         * Virement bancaire
         *
         */
        if ($methode_de_payement == 'virement-bancaire') {
            $mail_html .= '
													<div class="notre_info_vitement">' . $msg_virement_bc . '</div>';

            /*ETAT PAIEMENT*/
            $etat_reservation = 'virement-en-cours';
        } else {

            /****************************************
             *
             * Methode de paiement
             * Carte Bancaire Ou paypal
             *
             */

            if (($methode_de_payement == 'cb') || ($methode_de_payement == 'paypal')) {

                if ((isset($_POST['paiement_ID'])) && ($_POST['paiement_ID'] != '')) {
                    $mail_html .= '
														<div class="wrapaa">
															<strong class="derline">' . __("Identifiant de paiement", "acti") . '</strong><br/>
															<div class="id_pay" style="color: red;font-weight: bold;">' . $_POST['paiement_ID'] . '</div>
															</div>
														';
                }


                /*ETAT PAIEMENT*/
                $etat_reservation = 'acompte-paye';
            } else {
                /****************************************
                 *
                 * Methode de paiement
                 * Mandat Cash
                 *
                 */
                if ($methode_de_payement == 'mandat-cash') {
                    $mail_html .= '
															<div class="notre_info_vitement" style="margin-top: 25px;text-align: center;font-weight: bold;color: #57a7e4;">' . $msg_mandat_cash . '</div>
														';
                    /*ETAT PAIEMENT*/
                    $etat_reservation = 'mandat-cash-en-cours';
                } else {

                    if ($methode_de_payement == 'bnp-paribas-mercanet') {
                        if ((isset($_POST['Data'])) && (isset($_POST['Data']) != "")) {
                            if ($paymentResponse->isValid() && $paymentResponse->isSuccessful()) {
                                $mail_html .= '
																	<div class="wrapaa">
																		<strong class="derline">' . __("Identifiant de paiement", "acti") . '</strong><br/>
																		<div class="id_pay" style="color: red;font-weight: bold;">' . $bnp_transaction_ref . '</div>
																		</div>
																	';
                            }
                        }
                    }
                }
            }
        }




        $mail_html .= '</div>';

        $mail_html .= '<div style="margin: 35px 0;border: 1px solid gray;">';
        $mail_html .= '<legend style="display: block; padding: 0;margin: 0;background: #f7523c;padding: 5px 15px;color: white;"><h3 style="color: white;margin: 0;padding: 0;">' . __("Coût total", "acti") . '</h3></legend>';

        $m_meta_current_coursePrice = ((float)$data_form['current_coursePrice']);

        $m_val_prom_percent = ((float)$data_current_SimuCodePromo / 100);
        $m_val_prom_price = $m_meta_current_coursePrice * $m_val_prom_percent;
        $m_finale_price_promo = $m_meta_current_coursePrice - $m_val_prom_price;


        $mail_html .= '<div class="wrap_fieldset">
									<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __('Promotion', 'acti') . ': </strong></label> ' . $data_current_SimuCodePromo . '</p>
									<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . __("Coût total", "acti") . ': </strong></label>' . $m_finale_price_promo . ' &euro;</p>
								';
        $mail_html .= '</div>';

        $mail_html .= '</div>';







        foreach (Reservation::formulaire() as $fields_group):

            $mail_html .= '<fieldset style="margin: 35px 0;border: 1px solid gray;">
											<legend style="display: block; padding: 0;margin: 0;background: #f7523c;padding: 5px 15px;color: white;"><h3 style="color: white;margin: 0;padding: 0;">' . $fields_group["grp-name"] . '</h3></legend>
											<div class="wrap_fieldset">';

            foreach ($fields_group["grp-fields"] as $field):




                if ($field['slug'] == 'logement-acti') {
                    $mail_html .= '<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . $field['label'] . '</strong></label><br />
																		' . Reservation::logement_lists()[$data_form[$field['slug']]] . '</p>';
                } elseif ($field['slug'] == 'single-logement-acti') {
                    $mail_html .= '<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . $field['label'] . '</strong></label><br />
																		' . Reservation::single_double()[$data_form[$field['slug']]] . '</p>';
                } elseif ($field['slug'] == 'demi-pension-logement-acti') {
                    $mail_html .= '<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . $field['label'] . '</strong></label><br />
																		' . Reservation::demi_pension_pension_complete()[$data_form[$field['slug']]] . '</p>';
                } elseif ($field['slug'] == 'petit-dejeuner-acti') {
                    $mail_html .= '<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . $field['label'] . '</strong></label><br />
																		' . Reservation::petit_dejeuner_list()[$data_form[$field['slug']]] . '</p>';
                } else {

                    if ($field['slug'] == 'delf-acti') {
                        $mail_html .= '<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . $field['label'] . '</strong></label><br />
																		' . Reservation::yesNo()[(int)$data_form['delf-acti']] . '</p>';
                    } else {

                        switch ($field['type']):

                            case 'email':
                                $mail_html .= '<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . $field['label'] . '</strong></label><br />
																		' . $client_email . '</p>';
                                break;

                            case 'separator':
                                $mail_html .= '';
                                break;

                            default:
                                $mail_html .= '<p><label class="labell_fdset" style="color: #57a7e4;"><strong>' . $field['label'] . '</strong></label><br />
																		' . $data_form[$field['slug']] . '</p>';
                        endswitch;
                    }
                }




            endforeach;

            $mail_html .= '
											</div>
										</fieldset>';

        endforeach;




        $mail_html .= '</div>	
					</div>	

					
	';



        /****************************************
         *
         *
         * Create Student If Doest Not Register
         *
         */

        $etudiant_id = 0;

        if (username_exists($client_email) == false) {
            /****************************************
             *
             *
             * Insert Student
             *
             */
            $donnees_user_a_inserer = array();
            $donnees_user_a_inserer['user_login'] = $client_email;
            $donnees_user_a_inserer['user_nicename'] = $client_email;
            $donnees_user_a_inserer['display_name'] = $client_email;
            $donnees_user_a_inserer['nickname'] = $client_email;
            $donnees_user_a_inserer['last_name'] = $last_name;
            $donnees_user_a_inserer['first_name'] = $first_name;
            $donnees_user_a_inserer['user_pass'] = $random_password;
            $donnees_user_a_inserer['user_email'] = $client_email;
            $donnees_user_a_inserer['role'] = 'eleve';

            $id_eleve = wp_insert_user($donnees_user_a_inserer);
            update_user_meta($id_eleve, 'user_data_acti', $data_form);
            $etudiant_id = $id_eleve;

            /****************************************
             *
             *
             * Send Email Wp For Registration
             *
             */

            $headers = array(
                'Content-Type: text/html; charset= " ' . get_option('blog_charset') . '"'
            );

            $html_register_html = '
	<div class="banniere" style="background: #57a7e4;padding: 25px;color: white;text-align: center;font-size: 18px; margin-bottom: 50px;">
		<strong>' . $insc_msg_titre_mail . '</strong>
	</div>	

	<div class="content_wrap">
		<div class="terne_content_wrap">

			<div class="phrase_tete" style="text-align: center;">
				' . $insc_msg_mail . '
				<div>
					<strong>' . __("Identifiant", "acti") . ':</strong> ' . $client_email . '<br />
					<strong>' . __("Mot de passe", "acti") . ':</strong> ' . $random_password . '
				</div>
			</div>

		</div>
	</div>
';

            $html_register_html = $email_entete . $html_register_html . $email_footer;
            wp_mail($client_email, $sujet, $html_register_html, $headers);
            wp_mail('actilangue@kletel.net', $sujet, $html_register_html, $headers);
            wp_mail('contact@actilangue.com', $sujet, $html_register_html, $headers);
        } else {
            /****************************************
             *
             *
             * Update Student
             *
             */
            $user = get_user_by('email', $client_email);
            $id_utilisateur = $user->ID;

            update_user_meta($id_utilisateur, 'user_data_acti', $data_form);
            $etudiant_id = $id_utilisateur;
        }



        /****************************************
         *
         *
         * Create Booking if Student is Registered
         *
         */
        global $polylang;
        $nre_inital_place = Reservation::$nbre_place_dispo_inital;
        $translationIds = $polylang->model->get_translations('post', (int)$current_wp_course_ID);

        $fr_post_id = $translationIds['fr'];
        $fr_post = get_post((int)$fr_post_id);
        $encore_vide = get_post_meta($fr_post->ID, 'encore_vide__' . $current_sej_DEBUT . '__' . $current_sej_FIN, true);
        $place_disponilble = get_post_meta($fr_post->ID, 'place_disponilble__' . $current_sej_DEBUT . '__' . $current_sej_FIN, true);

        /****************************************
         *
         *
         * il y a déjà au moins une personne inscrit
         *
         */
        if ($encore_vide == 'possede_deja_au_moins_un') {
            if ($place_disponilble > 0) {
                $place_disponilble = $place_disponilble - 1;
                foreach ($translationIds as $cle_lang => $posta_ida) {
                    /*update PLACE DISPONIBLE for post and his pages translated*/
                    update_post_meta((int)$posta_ida, 'place_disponilble__' . $current_sej_DEBUT . '__' . $current_sej_FIN, $place_disponilble);
                }
            }
        } else {
            /****************************************
             *
             *
             * il n'y a aucun personne inscrit
             *
             */
            $place_disponilble = $nre_inital_place - 1;
            foreach ($translationIds as $cle_lang => $posta_ida) {
                /*update PLACE DISPONIBLE for post and his pages translated*/
                update_post_meta((int)$posta_ida, 'place_disponilble__' . $current_sej_DEBUT . '__' . $current_sej_FIN, $place_disponilble);
                update_post_meta((int)$posta_ida, 'encore_vide__' . $current_sej_DEBUT . '__' . $current_sej_FIN, 'possede_deja_au_moins_un');
            }
        }


        $wp_course_post = get_post((int)$current_wp_course_ID);
        $field_acti = get_post_meta($wp_course_post->ID, 'field_acti', true);




        //update_post_meta($wp_course_post->ID, 'place_disponilble', $client_email);


        $identifiant_cours = $field_acti['identifiant_cours'];
        $nbre_lecons_cours = $field_acti['nbre_lecons_cours'];

        $nw_reservation = array(
            'post_title'    => wp_strip_all_tags($wp_course_post->post_title . ' - ' . $nbre_lecons_cours),
            'post_content'  => $gen_course_detail, /*Course Detail by Web Service*/
            'post_type'  => 'reservation_actilang',
            'post_status'   => 'publish',
            'post_author'   => $etudiant_id
        );

        /****************************************
         *
         *
         * Insert Reservation
         *
         */



        $id_reservation = wp_insert_post($nw_reservation);

        update_post_meta($id_reservation, 'user_data_acti', $data_form);
        update_post_meta($id_reservation, 'client_email', $client_email);

        update_post_meta($id_reservation, 'id_cours_wp', $wp_course_post->ID);
        update_post_meta($id_reservation, 'identifiant_cours', $identifiant_cours);

        update_post_meta($id_reservation, 'debut_sejour', $current_sej_DEBUT);
        update_post_meta($id_reservation, 'fin_sejour', $current_sej_FIN);
        update_post_meta($id_reservation, 'etat_reservation', $etat_reservation);
        update_post_meta($id_reservation, 'methode_de_payement', $methode_de_payement);

        update_post_meta($id_reservation, 'val_delf', $data_current_SimuDELF);
        update_post_meta($id_reservation, 'val_promotion', $data_current_SimuCodePromo);




        if (($methode_de_payement == 'cb') || ($methode_de_payement == 'paypal')) {
            if ((isset($_POST['paiement_ID'])) && ($_POST['paiement_ID'] != '')) {
                update_post_meta($id_reservation, 'res_transaction_id', $_POST['paiement_ID']);
            }
        }

        if ((isset($_POST['Data'])) && (isset($_POST['Data']) != "")) {
            if ($paymentResponse->isValid() && $paymentResponse->isSuccessful()) {
                update_post_meta($id_reservation, 'res_transaction_id', $bnp_transaction_ref);
            }
        }



        /****************************************
         *
         *
         * Send Email Booking Confirmation
         *
         */

        $headers = array(
            'Content-Type: text/html; charset= " ' . get_option('blog_charset') . '"'

        );



        $mail_html = $email_entete . $mail_html . $email_footer;
        wp_mail($client_email, $sujet, $mail_html, $headers);
        wp_mail('actilangue@kletel.net', $sujet, $mail_html, $headers);
        wp_mail('contact@actilangue.com', $sujet, $mail_html, $headers);

        //wp_mail( 'rivomanana.dev@gmail.com', ''.__("Demande de devis", "acti"), $output_quote_mail, $headers);


        $lendar .= '
<div id="dialog-message" title="' . __("Inscription", "acti") . '">
	' . $msg_popa_reservation . '
</div>
';
    }




    /*************************
     *
     * Formulaire
     *
     */



    if (!session_id()) {
        session_start();
    }


    global $polylang;
    $curr_lang = pll_current_language();

    $lendar .= '
	<script type="text/javascript" src="https://www.paypalobjects.com/api/checkout.js">
	</script>
';

    $lendar .= '
	<div class="actilangue_booking_form">
		<form id="actilangue_inscription_cours" class="with_msgggg" data-langi="' . $curr_lang . '" method="post" action="">



	';
    if ((isset($_SESSION['current_courseID'])) && ($_SESSION['current_courseID'] != "") && ($_SESSION['current_courseID'])):




        /***********************
         *
         * Hidden params
         * 
         */
        $lendar .= '
			    <div style="overflow: hidden; height: 0">
			    	<textarea name="gen_course_detail" id="gen_course_detail">
			    		' . $_SESSION['current_courseDetail'] . '
			    	</textarea>
			    </div>';
        $lendar .= '<input type="hidden" id="SimuLangue" name="SimuLangue" value="' . strtoupper($curr_lang) . '" />';

        $lendar .= '<input type="hidden" id="current_wp_course_ID" name="current_wp_course_ID" value="' . $_SESSION['current_wp_course_ID'] . '" />';
        $lendar .= '<input type="hidden" id="current_sej_DEBUT" name="current_sej_DEBUT" value="' . $_SESSION['current_sej_DEBUT'] . '" />';
        $lendar .= '<input type="hidden" id="current_sej_FIN" name="current_sej_FIN" value="' . $_SESSION['current_sej_FIN'] . '" />';

        $lendar .= '<input type="hidden" id="current_SimuDate" name="current_SimuDate" value="' . $_SESSION['current_SimuDate'] . '" />';
        $lendar .= '<input type="hidden" id="id_current_course_ACTI" name="id_current_course_ACTI" value="' . $_SESSION['current_courseID'] . '" />';
        $lendar .= '<input type="hidden" id="current_courseDuration" name="current_courseDuration" value="' . $_SESSION['current_courseDuration'] . '" />';
        $lendar .= '<input type="hidden" id="current_coursePrice" name="current_coursePrice" value="' . $_SESSION['current_coursePrice'] . '" />';
        $lendar .= '<input type="hidden" id="current_Logement" name="current_Logement" value="' . $_SESSION['current_Logement'] . '" />';

        $lendar .= '<input type="hidden" id="current_SimuCodePromo" name="current_SimuCodePromo" value="' . $_SESSION['current_SimuCodePromo'] . '" />';
        $lendar .= '<input type="hidden" id="current_SimuDELF" name="current_SimuDELF" value="' . $_SESSION['current_SimuDELF'] . '" />';

    /*$lendar .= '<input type="hidden" id="code-promo-acti" name="code-promo-acti" value="'.$_SESSION['SimuCodePromo'].'" />';*/

    endif;

    $lendar .= '<div class="acti_erreur_container">
												<div class="in_acti_erreur_container">
													<div class="intro_msg_erreur">
														<div class="forma_un_erreur">' . __('Une erreur a été trouvée dans votre formulaire', 'acti') . '</div>
														<div class="forma_plusieurs_erreur">' . __('Des erreurs ont été trouvées dans votre formulaire', 'acti') . '</div>
													</div>
													<div class="contenu_msg_erreur"><ul></ul></div>
												</div>
												</div>';


    $lendar .= '
				<div id="groupe-inscription">
					';

    $requi = array(0 => '', 1 => ' *');
    if ((isset($_SESSION['current_courseID'])) && ($_SESSION['current_courseID'] != "") && ($_SESSION['current_courseID'])):

        $cala_date_current = $_SESSION['CalaDateArrivee'];

        foreach (Reservation::formulaire() as $fields_group):
            $lendar .= '
					<div class="frm_grp_acti">
						<div class="in_frm_grp_acti">
							<div class="terne_frm_grp_acti">

								<h3 class="grm_grp_titre">' . $fields_group["grp-name"] . '</h3>';

            $lendar .= '
								<div class="wrap_fields_acti">
									<div class="in_wrap_fields_acti">';

            foreach ($fields_group["grp-fields"] as $field):

                switch ($field['type']):

                    case 'select':
                        include('lib/select.php');
                        break;

                    case 'radio':
                        include('lib/radio.php');
                        break;


                    case 'textarea':
                        include('lib/textarea.php');
                        break;

                    case 'email':
                        include('lib/email.php');
                        break;

                    case 'separator':
                        include('lib/separator.php');
                        break;

                    default:
                        include('lib/text.php');
                endswitch;

            endforeach;

            $lendar .= '
									</div>
								</div>';

            $lendar .= '
							</div>
						</div>
					</div>
				';
        endforeach;



        $lendar .= '	

					<div class="btn_pay_acompte_acti">
						<div class="in_btn_pay_acompte_acti">
							<div class="terne_btn_pay_acompte_acti">

								<button id="go_to_methods" type="button">' . __("Continuer", "acti") . ' ' . Reservation::$prix_acompte . ' ' . __("Euros", "acti") . ' ►</button>								
							
							</div>
						</div>
					</div>';

    else:
        $lendar .= '<h3 class="select_sours_dab">' . __("Choix de cours", "acti") . '</h3>';
    endif;

    $lendar .= '
				</div>';




    $lendar .= '
				<div id="groupe-methode-paiement" style="display:none;">
		<div class="frm_grp_acti">
			<div class="in_frm_grp_acti">
				<div class="terne_frm_grp_acti">

					<h3 class="grm_grp_titre">' . Reservation::pay_methods()['grp-name'] . '</h3>
					<div class="wrap_fields_acti">
						<div class="in_wrap_fields_acti">
							<div class="wrap_field">
								<div class="in_wrap_field">';
    $compter = 0;
    foreach (Reservation::pay_methods()['lists'] as $pay_slug => $pay_name) {
        $checked_or_not = '';
        if ($compter == 0) {
            $checked_or_not = 'checked';
        }
        $lendar .= '
											<div>
												<label class="wrap_radio_acti">
											      <input type="radio" ' . $checked_or_not . ' name="methode_de_payement" value="' . $pay_slug . '"> <span class="hre_the_btn_cus">&nbsp;</span> <span class="hre_the_lbl_cus">' . $pay_name . '</span>
											    </label>
											</div>
										';
        $compter++;
    }

    $lendar .= '
								</div>
							</div>

							<div class="launch_pay_step">
								<div class="in_launch_pay_step">
									<div class="terne_launch_pay_step">


										<div id="btn_for_bnp_pariba" style="height: 0; overflow: hidden;">
											<div id="show_form_bnp" class="wrap_btn_paribas">
												
												<div class="en_blok wrap_confirm_your_pay">
													<span class="en_blok confirm_your_pay">' . __("Confirmation", "acti") . '</span>
													<span class="en_blok txt_confirm_your_pay">' . __("Acompte", "acti") . ' ' . Reservation::$prix_acompte . ' ' . __("Euros", "acti") . ' ►</span>
												</div>
												
											</div>
										</div>

										<div id="btn_for_standard" style="height: 0; overflow: hidden;">
											<button type="submit" id="launch_other_paypal">

												<div class="en_blok wrap_confirm_your_pay">
													<span class="en_blok confirm_your_pay">' . __("Confirmation", "acti") . '</span>
													<span class="en_blok txt_confirm_your_pay">' . __("Acompte", "acti") . ' ' . Reservation::$prix_acompte . ' ' . __("Euros", "acti") . ' ►</span>
												</div>
												

											</button>
										</div>
										<div id="btn_for_paypal" style="height: 0; overflow: hidden;">

											<div class="wrap_confi_paypal">
												<div class="confi_paypal">' . __("Confirmation", "acti") . '</div>
												<div class="txt_confi_paypal">' . __("Acompte", "acti") . ' ' . Reservation::$prix_acompte . ' ' . __("Euros", "acti") . ' ►</div>
											</div>

											<div id="paypal-button-container">
												
											</div>
										</div>

										

									</div>
								</div>
							</div>




						</div>
					</div>
				</div>
			</div>
		</div>

				';



    $lendar .= '
				</div>';

    $lendar .= '


			<div class="wrap_revenir_arriere" style="display: none;">
				<div class="in_wrap_revenir_arriere">
					<div class="terne_wrap_revenir_arriere">

					<button type="button" id="btn_prec_step">' . __("Revenir en arrière", "acti") . '</button>

					</div>
				</div>
			</div>
				<input type="hidden" name="actilangue_booking_nonce" value="' . wp_create_nonce(basename(__FILE__)) . '" />
		</form>
	</div>';


    $lendar .= '
	<div style="height: 0; width: 0; overflow: hidden; z-index: -1; opacity: 0; position: absolute;">
		<form id="form_for_bnp_paribas" name="redirectForm" method="POST" action="">
			<input type="hidden" id="Data" name="Data" value="" />
			<input type="hidden" id="InterfaceVersion" name="InterfaceVersion" value="" />
			<input type="hidden" id="Seal" name="Seal" value="" />			
		</form>
	</div>
	';

    return $lendar;
}

//add_shortcode( 'booking_form', 'booking_forma_func' );


function booking_recap_func($atts)
{
    if (!session_id()) {
        session_start();
    }
    $lendar = '';

    if ((isset($_SESSION['current_courseID'])) && ($_SESSION['current_courseID'] != "") && ($_SESSION['current_courseID'])):

        $lendar .= '
	
		<div class="acti_booking_recap">
		<div class="in_acti_booking_recap">
			<div class="terne_acti_booking_recap">

				<div class="title_recap">';

        if ((isset($_SESSION['current_courseID'])) && ($_SESSION['current_courseID'] != "") && ($_SESSION['current_courseID'])):

            $lendar .= '<h3>' . Cours::getListeCours()[$_SESSION['current_courseID']]['nom'] . '</h3>';

        else:
            $lendar .= '<h3>---</h3>';
        endif;

        /*<div id="lbl_code_promo" class="desc_coura">'.__("Promotion", "acti").': <span id="val_code_promo">-</span> </div>*/

        $lendar .= '</div>

				<div class="recap_acompte">
					<div class="in_recap_acompte">
						<div class="terne_recap_acompte">

							<div class="wrap_acompte">
								<span class="lbl_acompte">' . __("Acompte à régler", "acti") . ' : </span><span class="val_lbl_acompte">' . Reservation::$prix_acompte . '</span> €
							</div>
							
							<div class="wrap_cout_total">
								<span class="cout_total">' . __("Coût total", "acti") . ' : </span><span id="cout_total_sapn">' . $_SESSION['current_coursePrice'] . '</span> €
							</div>


							
							

						</div>
					</div>
				</div>

				<div class="wrapa_arrow_recap">
					<div class="arrow_recap">

					</div>
				</div>


				<div class="acti_booking_metas">
					<div class="in_acti_booking_metas">';


        global $polylang;
        $curr_lang = pll_current_language();

        $arra_semain = array(
            'fr' => 'semaine/s',
            'en' => 'week/s',
            'de' => 'Woche/n',
            'it' => 'settimana/e',
            'es' => 'semana/s'
        );



        $lendar .= '<div id="generated_meta">
								' . $_SESSION['current_courseDetail'] . '		
							</div>
							<div class="chosen_semaine">
								' . $_SESSION['current_courseDuration'] . ' ' . $arra_semain[$curr_lang] . '
							</div>

						
					</div>
				</div>



			</div>
		</div>
		</div>

';
    else:
        $lendar .= '<div class="acti_booking_recap" style="padding:0;"></div>';
    endif;



    return $lendar;
}

//add_shortcode( 'booking_recap', 'booking_recap_func' );



function nom_cours_Ajax()
{
    $c = new Cours($_POST['id_cours']);
    $un_cours = $c->getCour();


    $response = array();


    $response['cours'] = $un_cours;


    $response = json_encode($response);
    echo $response;
    die();
}
add_action('wp_ajax_nom_cours_Ajax', 'nom_cours_Ajax');
add_action('wp_ajax_nopriv_nom_cours_Ajax', 'nom_cours_Ajax');


function desc_cours_Ajax()
{
    $id_cours = $_POST['id_cours'];
    $le_post = get_post((int)$id_cours);
    $description_debut_cours = get_post_meta($le_post->ID, 'description_debut_cours', true);


    $response = array();


    $response['description_cours'] = $description_debut_cours;


    $response = json_encode($response);
    echo $response;
    die();
}
add_action('wp_ajax_desc_cours_Ajax', 'desc_cours_Ajax');
add_action('wp_ajax_nopriv_desc_cours_Ajax', 'desc_cours_Ajax');


function get_course_priceAjax()
{
    /*******************
     *
     * Start session
     *
     */
    if (!session_id()) {
        session_start();
    }

    /*******************
     *
     * Get Values
     *
     */
    $SimuLangue = $_POST['SimuLangue'];
    $current_sej_DEBUT = $_POST['current_sej_DEBUT'];
    $current_sej_FIN = $_POST['current_sej_FIN'];
    $current_wp_course_ID = $_POST['current_wp_course_ID'];
    $SimuDate = $_POST['SimuDate'];
    $SimuCours = $_POST['SimuCours'];
    $SimuDuree = $_POST['SimuDuree'];
    $SimuLogement = $_POST['SimuLogement'];

    $CalaDateArrivee = $_POST['CalaDateArrivee'];
    $SimuCodePromo = $_POST['code-promo-acti'];
    /*$SimuDELF = ($_POST['delf-acti'] == 'Oui' ? 'Vrai' : 'Faux');*/
    $SimuDELF_txt = ((int)$_POST['delf-acti'] == 0 ? 'Vrai' : 'Faux');
    $SimuDELF = $_POST['delf-acti'];



    /*******************
     *
     * Get Json
     *
     */


    $json_ws = file_get_contents('http://sgbd.kletel.net/4DAction/ActiURL/SimuDate=' . $SimuDate . '&SimuCours=' . strtoupper($SimuCours) . '&SimuDuree=' . $SimuDuree . '&SimuLogement=' . $SimuLogement . '&SimuLangue=' . $SimuLangue . '&SimuCodePromo=' . $SimuCodePromo . '&SimuDELF=' . $SimuDELF);
    $obj_ws = json_decode($json_ws);

    /*******************
     *
     * Assign to Session
     *
     */

    $texta = str_replace("<BR><BR><BR><BR>", "<BR><BR>", $obj_ws->V_Texte);

    $finale_price_promo = 0;
    $val_prix = (float)$obj_ws->V_Prix;



    /*$val_prom_percent = ((double)$obj_ws->V_Promo / 100);*/
    $val_prom_percent = 0;
    $val_prom_price = $val_prix * $val_prom_percent;
    $finale_price_promo = $val_prix - $val_prom_price;





    $_SESSION['SimuLangue'] = $SimuLangue;
    $_SESSION['current_sej_DEBUT'] = $current_sej_DEBUT;
    $_SESSION['current_sej_FIN'] = $current_sej_FIN;

    $_SESSION['current_wp_course_ID'] = $current_wp_course_ID;
    $_SESSION['current_SimuDate'] = $SimuDate;
    $_SESSION['current_courseID'] = $SimuCours;
    $_SESSION['current_courseDuration'] = $SimuDuree;
    $_SESSION['current_coursePrice'] = $finale_price_promo;
    $_SESSION['current_Logement'] = $SimuLogement;
    $_SESSION['current_courseDetail'] = $texta;

    $_SESSION['CalaDateArrivee'] = $CalaDateArrivee;
    $_SESSION['SimuCodePromo'] = $SimuCodePromo;
    $_SESSION['SimuDELF'] = $SimuDELF;
    /*$_SESSION['current_SimuCodePromo'] = $obj_ws->V_Promo;*/
    $_SESSION['current_SimuCodePromo'] = "";
    $_SESSION['current_SimuDELF'] = $obj_ws->V_DELF;


    $response = array();
    $response['le_prix'] = $finale_price_promo;
    $response['le_detail'] = str_replace("<BR><BR><BR><BR>", "<BR><BR>", $obj_ws->V_Texte);
    $response['detail_brut'] = $json_ws;
    $response['le_logement'] = $SimuLogement;
    $response['current_courseDetail'] = $texta;
    $response['CalaDateArrivee'] = $CalaDateArrivee;
    $response['SimuCodePromo'] = $SimuCodePromo;
    $response['SimuDELF'] = $SimuDELF;

    /*$response['current_SimuCodePromo'] = $obj_ws->V_Promo;*/
    $response['current_SimuCodePromo'] = "";
    $response['current_SimuDELF'] = $obj_ws->V_DELF;
    /*******************
     *
     * Send Response
     *
     */
    $response = json_encode($response);
    echo $response;
    die();
}
add_action('wp_ajax_get_course_priceAjax', 'get_course_priceAjax');
add_action('wp_ajax_nopriv_get_course_priceAjax', 'get_course_priceAjax');






/*******************
 *
 * Get Json
 *
 */
function debut_cours_func($atts = [], $content = null)
{
    $content = do_shortcode($content);

    $html = '';
    $html .= '
		<div class="debut_cours_wrap">
			<div class="in_debut_cours_wrap">
				
	';

    $html .= $content;

    $html .= '
			
		</div>
	</div>
	';

    return $html;
}

function btn_lien_func($atts = [], $content = null)
{
    $content = do_shortcode($content);

    $html = '';
    $html .= '<div class="wrap_btn_lien_func"><div class="in_wrap_btn_lien_func"><a class="' . $atts['class'] . '" href="' . $atts['lien'] . '"><span class="texita">';

    $html .= $content;

    $html .= '</span><span class="texita_fnd"></span></a></div></div>';

    return $html;
}


function getWPCoursByKeyword($cle_cours)
{

    $curr_lang = pll_current_language();

    $args_cours = array(
        'posts_per_page' => -1,
        'post_type' => 'cours-actilangue',
        'lang' => $curr_lang,
        'post_status' => 'publish'
    );

    $id_cours = 0;
    $cours = new WP_Query($args_cours);

    while ($cours->have_posts()): $cours->the_post();

        $field_acti = get_post_meta($cours->post->ID, 'field_acti', true);


        if ($field_acti['identifiant_cours'] == $cle_cours) {
            $id_cours = $cours->post->ID;
            break;
        }

    endwhile;

    return $id_cours;
}



function start_session()
{
    if (!session_id()) {
        session_start();
    }
}
add_action('init', 'start_session', 1);


function acti_popup_registration()
{
    $args_cours = array(
        'posts_per_page' => -1,
        'post_type' => 'cours-actilangue',
        'orderby' => 'id',
        'order' => 'ASC',
        'post_status' => 'publish'
    );

    $les_cours = new WP_Query($args_cours);
?>
    <form id="msg_forma"

        data-msg_nom="<?php echo __('Veuillez saisir votre nom', 'acti'); ?>"
        data-prenom="<?php echo __('Veuillez saisir votre prénom', 'acti'); ?>"
        data-msg_date_naissance="<?php echo __('Veuillez renseigner votre date de naissance', 'acti'); ?>"
        data-msg_nationalite="<?php echo __('Veuillez saisir votre nationalité', 'acti'); ?>"
        data-msg_profession="<?php echo __('Veuillez saisir votre profession', 'acti'); ?>"
        data-msg_adresse_1="<?php echo __('Veuillez saisir votre adresse N° 1', 'acti'); ?>"
        data-msg_adresse_2="<?php echo __('Veuillez saisir votre adresse N° 2', 'acti'); ?>"
        data-msg_code_postal="<?php echo __('Veuillez saisir votre code postal', 'acti'); ?>"
        data-msg_ville="<?php echo __('Veuillez saisir votre ville', 'acti'); ?>"
        data-msg_pays="<?php echo __('Veuillez saisir votre pays', 'acti'); ?>"
        data-msg_fax="<?php echo __('Veuillez saisir votre fax', 'acti'); ?>"
        data-msg_mail="<?php echo __("Veuillez saisir votre adresse e-mail", 'acti'); ?>"
        data-msg_mail_format="<?php echo __("Le format de votre adresse email n'est pas valide", 'acti'); ?>"
        data-msg_phone="<?php echo __("Veuillez saisir votre numéro de téléphone", 'acti'); ?>"
        data-msg_phone_format="<?php echo __("Le format de votre téléphone n'est pas valide", 'acti'); ?>"
        data-msg_find_acti="<?php echo __('Veuillez répondre à la question Comment avez-vous trouvé Actilangue ?', 'acti'); ?>"
        data-msg_date_arrivee="<?php echo __('Veuillez renseigner la date de votre arrivée', 'acti'); ?>"

        data-msg_renseigner_champ="<?php echo __('Ce champ est obligatoire', 'acti'); ?>"

        data-msg_date_naissance_annee_courant_fr="Votre date de naissance est invalide, veuillez corriger"
        data-msg_date_naissance_annee_courant_en="Please, your date of birth is invalid"
        data-msg_date_naissance_annee_courant_de="Bitte geben, Geburtsdatum ist ungültig"
        data-msg_date_naissance_annee_courant_it="Per favore, la tua data di nascita non è valida"
        data-msg_date_naissance_annee_courant_es="Por favor, tu fecha de nacimiento no es válida"


        style="display: block; height: 0; width: 0; overflow: hidden;position: absolute;z-index: -1;"></form>
    <div class="acti_popup_registration" style="display: none;"><span class="fermer_popa">x</span>
        <div class="in_acti_popup_registration">
            <div class="terne_acti_popup_registration">

                <div class="titre_popa">
                    <h3><?php echo __("Inscription/ Réservation", "acti"); ?></h3>
                </div>

                <div class="pop_contenu">
                    <div class="in_pop_contenu">
                        <div class="terne_pop_contenu">

                            <div class="l_popa">
                                <div class="inl_popa">

                                    <form id="popup_reservation" action="" method="post">
                                        <div class="terne_l_popa">

                                            <div class="niv_plus_heada">
                                                <div class="in_niv_plus_heada">

                                                    <div class="niv_acti">
                                                        <div class="in_niv_acti">

                                                            <div class="titrea_popop">
                                                                <div class="nombre_cours">1</div>
                                                                <div class="vr_titrea_popop"><?php echo __("Quel est votre niveau ?", "acti"); ?></div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div class="heada_acti">
                                                        <div class="in_heada_acti">

                                                            <select id="select_a_couse" name="select_a_couse">
                                                                <?php
                                                                while ($les_cours->have_posts()): $les_cours->the_post();
                                                                ?>
                                                                    <option id="optia_<?php echo $les_cours->post->ID; ?>" value="<?php echo get_permalink((int)$les_cours->post->ID); ?>"><?php echo $les_cours->post->post_title; ?></option>
                                                                <?php
                                                                endwhile;
                                                                wp_reset_postdata();


                                                                ?>
                                                            </select>

                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                            <div class="dilpm_and_btn">
                                                <div class="in_dilpm_and_btn">
                                                    <div class="terne_dilpm_and_btn">

                                                        <div class="btn_dipl">
                                                            <button type="submit"><?php echo __("Inscription", "acti"); ?></button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>


                                        </div>

                                    </form>
                                </div>
                            </div>


                            <div class="r_popa">
                                <div class="in_r_popa">
                                    <div class="terne_r_popa">

                                        <div class="wrap_contenu_popa">
                                            <div class="in_wrap_contenu_popa">
                                                <div class="terne_wrap_contenu_popa">
                                                    <?php
                                                    while ($les_cours->have_posts()): $les_cours->the_post();
                                                        $description_courte_cours = get_post_meta($les_cours->post->ID, 'description_courte_cours', true);
                                                    ?>
                                                        <div id="div_optia_<?php echo $les_cours->post->ID; ?>" class="div_optia" style="display: none;">
                                                            <?php echo $description_courte_cours; ?>
                                                        </div>
                                                    <?php
                                                    endwhile;
                                                    wp_reset_postdata();
                                                    ?>

                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

<?php
}
add_action('get_footer', 'acti_popup_registration');


function titre_descriptif_func($atts)
{
    global $post;
    $le_meta = get_post_meta($post->ID, 'custom_titre', true);
    return apply_filters('the_content', $le_meta);
}
//add_shortcode('actilangue_TITRE_DESCRIPTIF', 'titre_descriptif_func');

function acti_description_courte_func($atts)
{
    global $post;
    $le_meta = get_post_meta($post->ID, 'description_courte_cours', true);
    return apply_filters('the_content', $le_meta);
}
//add_shortcode('actilangue_DESCRIPTION_COURTE', 'acti_description_courte_func');

function mon_compte_table_func($atts)
{

    $bnp_paribas_cle_secrete = get_option('bnp_paribas_cle_secrete');
    $bnp_paribas_merchant_id = get_option('bnp_paribas_merchant_id');
    $bnp_paribas_mode = get_option('bnp_paribas_mode');



    global $polylang;
    $curr_lang = pll_current_language();

    $msg_popa_reservation = get_option('msg_popa_reservation_' . $curr_lang);

    global $current_user;
    $current_user = wp_get_current_user();
    $donnees_user = get_userdata($current_user->ID);
    $lelogin = $donnees_user->data->user_login;
    $lemail = $donnees_user->data->user_email;
    $le_role = $donnees_user->roles[0];

    $args_reservtio = array(
        'posts_per_page' => -1,
        'post_type' => 'reservation_actilang',
        'post_status' => 'publish'
    );

    if ($le_role != 'administrator') {
        $args_reservtio['author'] = $current_user->ID;
    }

    $les_reservtio = new WP_Query($args_reservtio);


    $array_pay_ok = array('virement-paye', 'acompte-paye');




    $arry_field_a_afficher = array('genre-acti', 'nom-acti', 'prenom-acti', 'date-naissance-acti', 'phone-acti', 'acti_form_email');

    $tbl_lbl_reservation = Reservation::lbl_table_de_reservation();

    $t_html = '';

    if ((isset($_POST['Data'])) && (isset($_POST['Data']) != "")) {
        $paymentResponse = new Mercanet($bnp_paribas_cle_secrete);
        $paymentResponse->setResponse($_POST);

        if ($paymentResponse->isValid() && $paymentResponse->isSuccessful()) {
            $t_html .= '
				<div id="dialog-message" title="' . __("Inscription", "acti") . '">
					' . $msg_popa_reservation . '
				</div>
	';
        }
    }



    if (is_user_logged_in()):
        $t_html .= '
		<table id="liste_reservation" style="width:100%">
			<thead>
				<tr>';

        if ($le_role == 'administrator') {
            $t_html .= '<th>' . __("Elève", "acti") . '</th>';
        }



        foreach ($tbl_lbl_reservation as $cle => $valeur) {
            $t_html .= '					
						<th class="' . $cle . '">' . $valeur . '</th>					
				';
        }

        $t_html .= '
				</tr>
			</thead>
			<tbody>';

        while ($les_reservtio->have_posts()): $les_reservtio->the_post();

            $debut_sejour = get_post_meta($les_reservtio->post->ID, 'debut_sejour', true);
            $fin_sejour = get_post_meta($les_reservtio->post->ID, 'fin_sejour', true);
            $etat_reservation = get_post_meta($les_reservtio->post->ID, 'etat_reservation', true);
            $user_data_acti = get_post_meta($les_reservtio->post->ID, 'user_data_acti', true);
            $client_email = get_post_meta($les_reservtio->post->ID, 'client_email', true);
            $acti_form_email = get_post_meta($les_reservtio->post->ID, 'acti_form_email', true);

            $res_transaction_id = get_post_meta($les_reservtio->post->ID, 'res_transaction_id', true);



            $t_html .= '
						<tr>';


            if ($le_role == 'administrator'):
                $t_html .= '<td>
								<div>
								<a target="__blank" href="' . admin_url('post.php?post=' . $les_reservtio->post->ID . '&action=edit') . '">
							';

                foreach ($user_data_acti as $cle => $valeur) {
                    if (in_array($cle, $arry_field_a_afficher)) {
                        $t_html .= $valeur . '<br />';
                    }
                }

                $t_html .= '
							</a>
								</div>
							</td>';
            endif;


            if ($le_role == 'administrator') {
                $t_html .= '<td class="titre_td_cours"><a target="__blank" href="' . admin_url('post.php?post=' . $les_reservtio->post->ID . '&action=edit') . '">' . $les_reservtio->post->post_title . '</a></td>';
            } else {
                $t_html .= '<td class="titre_td_cours">' . $les_reservtio->post->post_title . '</td>';
            }


            $classe_etat = '';
            if (in_array($etat_reservation, $array_pay_ok)) {
                $classe_etat = ' etat_paya_ok ';
            }


            $t_html .= '
							
							<td>' . $debut_sejour . '</td>
							<td>' . $fin_sejour . '</td>';

            if ($etat_reservation == 'acompte-paye') {
                $t_html .= '
								<td>
									<div class="etat_paya ' . $classe_etat . '">';
                $t_html .= '<div>' . Reservation::lbl_etat_reservation()[$etat_reservation] . '</div>';

                if (($res_transaction_id) && ($res_transaction_id != '')) {
                    $t_html .= '<div class="ref_transa_di">' . $res_transaction_id . '</div>';
                }


                $t_html .= '
									</div>
								</td>';
            } else {
                $t_html .= '<td> <div class="etat_paya ' . $classe_etat . '">' . Reservation::lbl_etat_reservation()[$etat_reservation] . '</div></td>';
            }





            $t_html .= '</tr>
					';
        endwhile;
        wp_reset_postdata();
        $t_html .= '
			</tbody>
		</table>';
    else:
        $t_html .= do_shortcode('[login-with-ajax]');
    endif;



    return $t_html;
}
//add_shortcode( 'reservation_table', 'mon_compte_table_func' );





/*******************
 *
 * Edit Reservation
 *
 */

function book_divi_metabox_func()
{
    add_meta_box(
        'id_boook_metabox', // $id
        'Paramètres', // $title
        'show_book_divi_metabox_func', // $callback
        array('reservation_actilang'), // $page
        'normal', // $context
        'high'
    ); // $priority
}
add_action('add_meta_boxes', 'book_divi_metabox_func');

function show_book_divi_metabox_func()
{

    global $post;
    $settingss_o = array('editor_height' => 150);
    $user_data_acti = get_post_meta($post->ID, 'user_data_acti', true);
    $client_email = get_post_meta($post->ID, 'client_email', true);
    $val_delf = get_post_meta($post->ID, 'val_delf', true);
    $val_promotion = get_post_meta($post->ID, 'val_promotion', true);

    $etat_reservation = get_post_meta($post->ID, 'etat_reservation', true);

    $res_transaction_id = get_post_meta($post->ID, 'res_transaction_id', true);
    $methode_de_payement = get_post_meta($post->ID, 'methode_de_payement', true);



?>

    <input type="hidden" name="book_divi_metabox_nonce" value="<?php echo wp_create_nonce(basename(__FILE__)); ?>" />


    <div class="course_params">
        <div class="in_course_params">
            <div class="terne_course_params">

                <div class="et_pb_section et_pb_section_acti">
                    <div class="et-pb-section-content">

                        <div class="et-pb-options-tabs">
                            <div class="et-pb-options-tab">


                                <h3 class="titre_reservationa">
                                    <?php echo $post->post_content; ?>
                                </h3>


                                <div class="editer_etat_creservation">
                                    <div class="in_editer_etat_creservation">
                                        <h3 class="et-pb-option-toggle-title">Modification de l'état de réservation</h3>
                                        <select name="le_etat_reservation" id="le_etat_reservation">
                                            <option value="">Veuillez choisir</option>
                                            <?php
                                            foreach (Reservation::lbl_etat_reservation() as $slug_etat => $val_etat) {
                                                if ($slug_etat == $etat_reservation) {
                                            ?>
                                                    <option selected value="<?php echo $slug_etat; ?>"><?php echo $val_etat; ?></option>
                                                <?php
                                                } else {
                                                ?>
                                                    <option value="<?php echo $slug_etat; ?>"><?php echo $val_etat; ?></option>
                                            <?php
                                                }
                                            }
                                            ?>
                                        </select>

                                    </div>
                                </div>


                                <div class="course_params">
                                    <div class="in_course_params">
                                        <div class="terne_course_params">

                                            <div class="et_pb_section et_pb_section_acti">
                                                <div class="et-pb-section-content">

                                                    <div class="et-pb-options-tabs">
                                                        <div class="et-pb-options-tab">

                                                            <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                                                <h3 class="et-pb-option-toggle-title">Paiement</h3>
                                                                <div class="et-pb-option-toggle-content">
                                                                    <div class="et-pb-option et-pb-option--text">
                                                                        <label>Identifiant du paiement</label>
                                                                        <div class="et-pb-option-container et-pb-option-container--text">
                                                                            <div><?php echo $res_transaction_id; ?></div>
                                                                        </div>
                                                                    </div>

                                                                    <div class="et-pb-option et-pb-option--text">
                                                                        <label>Méthode de paiement</label>
                                                                        <div class="et-pb-option-container et-pb-option-container--text">
                                                                            <?php if ((isset(Reservation::pay_methods()['lists'][$methode_de_payement])) && (Reservation::pay_methods()['lists'][$methode_de_payement] != '')): ?>
                                                                                <input type="text" class="regular-text" name="methode_de_payement" value="<?php echo Reservation::pay_methods()['lists'][$methode_de_payement]; ?>" />
                                                                            <?php else: ?>
                                                                                <input type="text" class="regular-text" name="methode_de_payement" value="" />
                                                                            <?php endif; ?>
                                                                        </div>
                                                                    </div>

                                                                    <div class="et-pb-option et-pb-option--text">
                                                                        <label>Promotion</label>
                                                                        <div class="et-pb-option-container et-pb-option-container--text">
                                                                            <div><?php echo $val_promotion; ?></div>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>


                                <?php foreach (Reservation::formulaire() as $fields_group):  ?>
                                    <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                        <h3 class="et-pb-option-toggle-title"><?php echo $fields_group["grp-name"]; ?></h3>
                                        <div class="et-pb-option-toggle-content">

                                            <?php foreach ($fields_group["grp-fields"] as $field): ?>

                                                <div class="et-pb-option et-pb-option--text">
                                                    <label for="<?php echo $un_champs['name']; ?>"><?php echo $field['label']; ?> : </label>
                                                    <?php

                                                    if ($field['slug'] == 'logement-acti') {
                                                    ?>
                                                        <div class="et-pb-option-container et-pb-option-container--text">
                                                            <?php echo Reservation::logement_lists()[$user_data_acti[$field['slug']]]; ?>
                                                        </div>
                                                    <?php
                                                    } elseif ($field['slug'] == 'single-logement-acti') {
                                                    ?>
                                                        <div class="et-pb-option-container et-pb-option-container--text">
                                                            <?php echo Reservation::single_double()[$user_data_acti[$field['slug']]]; ?>
                                                        </div>
                                                    <?php
                                                    } elseif ($field['slug'] == 'demi-pension-logement-acti') {
                                                    ?>
                                                        <div class="et-pb-option-container et-pb-option-container--text">
                                                            <?php echo Reservation::demi_pension_pension_complete()[$user_data_acti[$field['slug']]]; ?>
                                                        </div>
                                                    <?php

                                                    } elseif ($field['slug'] == 'petit-dejeuner-acti') {
                                                    ?>
                                                        <div class="et-pb-option-container et-pb-option-container--text">
                                                            <?php echo Reservation::petit_dejeuner_list()[$user_data_acti[$field['slug']]]; ?>
                                                        </div>
                                                        <?php
                                                    } else {

                                                        if ($field['slug'] == 'delf-acti') {


                                                        ?>
                                                            <div class="et-pb-option-container et-pb-option-container--text">
                                                                <?php echo Reservation::yesNo()[(int)$user_data_acti['delf-acti']]; /*echo $val_delf;*/ ?>
                                                            </div>
                                                            <?php
                                                        } else {
                                                            switch ($field['type']):
                                                                case 'email':
                                                            ?>
                                                                    <div class="et-pb-option-container et-pb-option-container--text">
                                                                        <?php echo $client_email; ?>
                                                                    </div>
                                                                <?php
                                                                    break;
                                                                case 'separator':
                                                                    echo '';
                                                                    break;

                                                                default:
                                                                ?>
                                                                    <div class="et-pb-option-container et-pb-option-container--text">
                                                                        <?php echo $user_data_acti[$field['slug']]; ?>
                                                                    </div>
                                                    <?php
                                                            endswitch;
                                                        }
                                                    }


                                                    ?>

                                                </div>

                                            <?php endforeach;  ?>

                                        </div>
                                    </div>
                                <?php endforeach;  ?>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>


<?php

}

function save_book_divi_metabox_func($post_id)
{
    if (!wp_verify_nonce($_POST['book_divi_metabox_nonce'], basename(__FILE__)))
        return $post_id;

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
        return $post_id;

    if ('reservation_actilang' == $_POST['post_type']) {
        if (!current_user_can('edit_page', $post_id)) {
            return $post_id;
        } elseif (!current_user_can('edit_post', $post_id)) {
            return $post_id;
        }
    }


    update_post_meta($post_id, 'etat_reservation', $_POST['le_etat_reservation']);
}

add_action('save_post', 'save_book_divi_metabox_func');










function get_nbre_placeAjax()
{
    global $polylang;
    $course_ID = $_POST['course_ID'];
    $debut_sejour = $_POST['debut_sejour'];
    $fin_sejour = $_POST['fin_sejour'];

    $nre_inital_place = Reservation::$nbre_place_dispo_inital;
    $translationIds = $polylang->model->get_translations('post', (int)$course_ID);
    $fr_post_id = $translationIds['fr'];
    $fr_post = get_post((int)$fr_post_id);

    $encore_vide = get_post_meta($fr_post->ID, 'encore_vide__' . $debut_sejour . '__' . $fin_sejour, true);
    $place_disponilble = get_post_meta($fr_post->ID, 'place_disponilble__' . $debut_sejour . '__' . $fin_sejour, true);

    $nre_place_dispo = 0;

    if ($encore_vide == 'possede_deja_au_moins_un') {
        $nre_place_dispo = $place_disponilble;
    } else {
        $nre_place_dispo = $nre_inital_place;
    }



    $response = array();
    $response['nbre_place'] = $nre_place_dispo;
    $response = json_encode($response);
    echo $response;
    die();
}
add_action('wp_ajax_get_nbre_placeAjax', 'get_nbre_placeAjax');
add_action('wp_ajax_nopriv_get_nbre_placeAjax', 'get_nbre_placeAjax');


/*******************
 *
 * Page option
 *
 */
add_action('admin_menu', 'acti_optiona_func');
function acti_optiona_func()
{
    add_menu_page('Actilangue', 'Actilangue', 'manage_options', 'actilangue-options', 'page_acti_optiona_func');
    add_submenu_page(
        'actilangue-options',
        'Modules de paiement',
        'Modules de paiement',
        'manage_options',
        'actilangue-modules-paiement-options',
        'actilangue_modules_paiement_options_func'
    );
}


/****************************************
 *
 * Actilangue - Paypal page Options
 *
 */
function actilangue_modules_paiement_options_func()
{
    if (!current_user_can('manage_options')) {
        wp_die("Aucune autorisation pour gerer cette page");
    }

    global $polylang;
    $liste_langues = pll_languages_list();
    $settingss_o = array('editor_height' => 150);

    if (isset($_POST['update_settings'])) {
        $env_test_client_id = $_POST['env_test_client_id'];
        $env_prod_client_id = $_POST['env_prod_client_id'];
        $env_test_ou_prod = $_POST['env_test_ou_prod'];

        $bnp_paribas_cle_secrete = $_POST['bnp_paribas_cle_secrete'];
        $bnp_paribas_version_cle = $_POST['bnp_paribas_version_cle'];
        $bnp_paribas_merchant_id = $_POST['bnp_paribas_merchant_id'];
        $bnp_paribas_mode = $_POST['bnp_paribas_mode'];


        update_option('bnp_paribas_version_cle', $bnp_paribas_version_cle);
        update_option('bnp_paribas_cle_secrete', $bnp_paribas_cle_secrete);
        update_option('bnp_paribas_merchant_id', $bnp_paribas_merchant_id);
        update_option('bnp_paribas_mode', $bnp_paribas_mode);

        update_option('env_test_client_id', $env_test_client_id);
        update_option('env_prod_client_id', $env_prod_client_id);
        update_option('env_test_ou_prod', $env_test_ou_prod);
    }

    $env_test_client_id = get_option('env_test_client_id');
    $env_prod_client_id = get_option('env_prod_client_id');
    $env_test_ou_prod = get_option('env_test_ou_prod');


    $bnp_paribas_version_cle = get_option('bnp_paribas_version_cle');
    $bnp_paribas_cle_secrete = get_option('bnp_paribas_cle_secrete');
    $bnp_paribas_merchant_id = get_option('bnp_paribas_merchant_id');
    $bnp_paribas_mode = get_option('bnp_paribas_mode');


    $prod_test_arr = array(
        'production' => 'Production',
        'sandbox' => 'Test',
    );
?>
    <form method="post" action="">

        <div class="wrap_course_params">
            <div class="course_params">
                <div class="in_course_params">
                    <div class="terne_course_params">

                        <div class="et_pb_section et_pb_section_acti">
                            <div class="et-pb-section-content">

                                <div class="et-pb-options-tabs">
                                    <div class="et-pb-options-tab">

                                        <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                            <h3 class="et-pb-option-toggle-title">Paypal</h3>

                                            <div class="et-pb-option-toggle-content">
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Client ID - Test</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">
                                                        <input type="text" class="regular-text" name="env_test_client_id" value="<?php echo $env_test_client_id; ?>" />
                                                    </div>
                                                </div>
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Client ID - Production</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">
                                                        <input type="text" class="regular-text" name="env_prod_client_id" placeholder="<insert production client id>" value="<?php echo $env_prod_client_id; ?>" />
                                                    </div>
                                                </div>

                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Paypal Mode (Production / Test)</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">
                                                        <select class="regular-text" name="env_test_ou_prod">
                                                            <?php foreach ($prod_test_arr as $un_k => $txt_k): ?>
                                                                <?php if ($env_test_ou_prod == $un_k): ?>
                                                                    <option selected value="<?php echo $un_k; ?>"><?php echo $txt_k; ?></option>
                                                                <?php else: ?>
                                                                    <option value="<?php echo $un_k; ?>"><?php echo $txt_k; ?></option>
                                                                <?php endif; ?>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                        <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                            <h3 class="et-pb-option-toggle-title">BNP PARIBAS Mercanet</h3>
                                            <div class="et-pb-option-toggle-content">
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Clé secrète</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">
                                                        <input type="text" class="regular-text" name="bnp_paribas_cle_secrete" value="<?php echo $bnp_paribas_cle_secrete; ?>" />
                                                    </div>
                                                </div>
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Version de la clé secrète</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">


                                                        <?php $vers_arr = array(1, 2, 3, 4, 5); ?>
                                                        <select class="regular-text" name="bnp_paribas_version_cle">
                                                            <?php foreach ($vers_arr as $ver_cle): ?>
                                                                <?php if ((int)$ver_cle == $bnp_paribas_version_cle): ?>
                                                                    <option selected value="<?php echo $ver_cle; ?>">Version <?php echo $ver_cle; ?></option>
                                                                <?php else: ?>
                                                                    <option value="<?php echo $ver_cle; ?>">Version <?php echo $ver_cle; ?></option>
                                                                <?php endif; ?>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Merchant ID</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">
                                                        <input type="text" class="regular-text" name="bnp_paribas_merchant_id" value="<?php echo $bnp_paribas_merchant_id; ?>" />
                                                    </div>
                                                </div>

                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>BNP PARIBAS Mercanet Mode (Production / Test)</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">
                                                        <select class="regular-text" name="bnp_paribas_mode">
                                                            <?php foreach ($prod_test_arr as $un_k => $txt_k): ?>
                                                                <?php if ($bnp_paribas_mode == $un_k): ?>
                                                                    <option selected value="<?php echo $un_k; ?>"><?php echo $txt_k; ?></option>
                                                                <?php else: ?>
                                                                    <option value="<?php echo $un_k; ?>"><?php echo $txt_k; ?></option>
                                                                <?php endif; ?>
                                                            <?php endforeach; ?>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>

        <div>
            <input type="submit" class="btn btn-success" name="save" value="Mettre à jour" />
            <input type="hidden" name="action" value="update" />
            <input type="hidden" name="update_settings" value="Y" />
        </div>

    </form>
<?php

}



/****************************************
 *
 * Actilangue - Default page Options
 *
 */
function page_acti_optiona_func()
{
    if (!current_user_can('manage_options')) {
        wp_die("Aucune autorisation pour gerer cette page");
    }

    global $polylang;
    $liste_langues = pll_languages_list();

    if (isset($_POST['update_settings'])) {


        $pejy_tarif = $_POST['pejy_tarif'];
        $pejy_devis = $_POST['pejy_devis'];
        $pejy_inscription = $_POST['pejy_inscription'];
        $pejy_tarif = $_POST['pejy_tarif'];



        update_option('pejy_tarif', $pejy_tarif);
        update_option('pejy_devis', $pejy_devis);
        update_option('pejy_inscription', $pejy_inscription);
        update_option('pejy_tarif', $pejy_tarif);


        foreach ($liste_langues as $cle_langue):
            $msg_virement_bc = $_POST['msg_virement_bc_' . $cle_langue];
            $msg_mandat_cash = $_POST['msg_mandat_cash_' . $cle_langue];
            $msg_bonjour = $_POST['msg_bonjour_' . $cle_langue];
            $msg_titre_mail = $_POST['msg_titre_mail_' . $cle_langue];
            $msg_avant_pied_mail = $_POST['msg_avant_pied_mail_' . $cle_langue];
            $msg_pied_mail = $_POST['msg_pied_mail_' . $cle_langue];
            $insc_msg_titre_mail = $_POST['insc_msg_titre_mail_' . $cle_langue];
            $insc_msg_mail = $_POST['insc_msg_mail_' . $cle_langue];
            $msg_popa_reservation = $_POST['msg_popa_reservation_' . $cle_langue];

            update_option('msg_virement_bc_' . $cle_langue, $msg_virement_bc);
            update_option('msg_mandat_cash_' . $cle_langue, $msg_mandat_cash);
            update_option('msg_bonjour_' . $cle_langue, $msg_bonjour);
            update_option('msg_titre_mail_' . $cle_langue, $msg_titre_mail);
            update_option('msg_avant_pied_mail_' . $cle_langue, $msg_avant_pied_mail);
            update_option('msg_pied_mail_' . $cle_langue, $msg_pied_mail);
            update_option('insc_msg_titre_mail_' . $cle_langue, $insc_msg_titre_mail);
            update_option('insc_msg_mail_' . $cle_langue, $insc_msg_mail);
            update_option('msg_popa_reservation_' . $cle_langue, $msg_popa_reservation);
        endforeach;
    }


    $settingss_o = array('editor_height' => 150);

    $pejy_tarif = get_option('pejy_tarif');
    $pejy_inscription = get_option('pejy_inscription');
    $pejy_devis = get_option('pejy_devis');

    $args_page = array(
        'posts_per_page' => -1,
        'orderby' => 'title',
        'order' => 'ASC',
        'post_type' => 'page',
        'post_status' => 'publish',
        'nopaging' => true,
        'lang' => 'fr',
    );

    $les_pages = new WP_Query($args_page);
?>
    <form method="post" action="">

        <div class="wrap_course_params">
            <div class="course_params">
                <div class="in_course_params">
                    <div class="terne_course_params">

                        <div class="et_pb_section et_pb_section_acti">
                            <div class="et-pb-section-content">

                                <div class="et-pb-options-tabs">
                                    <div class="et-pb-options-tab">

                                        <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                            <h3 class="et-pb-option-toggle-title">Sélection de page</h3>

                                            <div class="et-pb-option-toggle-content">
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Tarifs</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">

                                                        <select id="pejy_tarif" name="pejy_tarif" class="regular-text">
                                                            <option value="">Sélectionner une page</option>
                                                            <?php
                                                            while ($les_pages->have_posts()) : $les_pages->the_post();
                                                                if ((int)$pejy_tarif == $les_pages->post->ID) {
                                                            ?>
                                                                    <option selected value="<?php echo $les_pages->post->ID; ?>"><?php echo $les_pages->post->post_title; ?></option>
                                                                <?php
                                                                } else {
                                                                ?>
                                                                    <option value="<?php echo $les_pages->post->ID; ?>"><?php echo $les_pages->post->post_title; ?></option>
                                                            <?php
                                                                }
                                                            endwhile;
                                                            wp_reset_postdata();
                                                            ?>
                                                        </select>

                                                    </div>
                                                </div>
                                            </div>

                                            <div class="et-pb-option-toggle-content">
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Demande de réservation</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">

                                                        <select id="pejy_inscription" name="pejy_inscription" class="regular-text">
                                                            <option value="">Sélectionner une page</option>
                                                            <?php
                                                            while ($les_pages->have_posts()) : $les_pages->the_post();
                                                                if ((int)$pejy_inscription == $les_pages->post->ID) {
                                                            ?>
                                                                    <option selected value="<?php echo $les_pages->post->ID; ?>"><?php echo $les_pages->post->post_title; ?></option>
                                                                <?php
                                                                } else {
                                                                ?>
                                                                    <option value="<?php echo $les_pages->post->ID; ?>"><?php echo $les_pages->post->post_title; ?></option>
                                                            <?php
                                                                }
                                                            endwhile;
                                                            wp_reset_postdata();
                                                            ?>
                                                        </select>

                                                    </div>
                                                </div>
                                            </div>

                                            <div class="et-pb-option-toggle-content">
                                                <div class="et-pb-option et-pb-option--text">
                                                    <label>Demande de devis</label>
                                                    <div class="et-pb-option-container et-pb-option-container--text">

                                                        <select id="pejy_devis" name="pejy_devis" class="regular-text">
                                                            <option value="">Sélectionner une page</option>
                                                            <?php
                                                            while ($les_pages->have_posts()) : $les_pages->the_post();
                                                                if ((int)$pejy_devis == $les_pages->post->ID) {
                                                            ?>
                                                                    <option selected value="<?php echo $les_pages->post->ID; ?>"><?php echo $les_pages->post->post_title; ?></option>
                                                                <?php
                                                                } else {
                                                                ?>
                                                                    <option value="<?php echo $les_pages->post->ID; ?>"><?php echo $les_pages->post->post_title; ?></option>
                                                            <?php
                                                                }
                                                            endwhile;
                                                            wp_reset_postdata();
                                                            ?>
                                                        </select>

                                                    </div>
                                                </div>
                                            </div>


                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>


        <div class="wrap_course_params">
            <div class="course_params">
                <div class="in_course_params">
                    <div class="terne_course_params">




                        <div class="langgue_listes">
                            <div class="in_langgue_listes">
                                <ul>
                                    <?php
                                    $nbre_lange = 0;
                                    $cls_li = '';

                                    foreach ($liste_langues as $cle_langue):
                                        if ($nbre_lange == 0) {
                                            $cls_li = 'activa';
                                        }
                                    ?>
                                        <li>
                                            <a id="li_la_<?php echo $cle_langue; ?>" href="#" class="langue_opa <?php echo $cls_li; ?>">
                                                <img src="<?php echo  plugins_url('images/flags/' . $cle_langue . '.png', __FILE__); ?>" />
                                            </a>
                                        </li>
                                    <?php $nbre_lange++;
                                    endforeach; ?>
                                </ul>
                            </div>
                        </div>


                        <div class="et_pb_section et_pb_section_acti">
                            <div class="et-pb-section-content">

                                <div class="et-pb-options-tabs">
                                    <div class="et-pb-options-tab">
                                        <?php
                                        $nbre_langue = 0;
                                        foreach ($liste_langues as $cle_langue):
                                            $cls_active = 'display: none';
                                            if ($nbre_langue == 0) {
                                                $cls_active = 'display: block;';
                                            }
                                            $msg_virement_bc = get_option('msg_virement_bc_' . $cle_langue);
                                            $msg_mandat_cash = get_option('msg_mandat_cash_' . $cle_langue);
                                            $msg_bonjour = get_option('msg_bonjour_' . $cle_langue);
                                            $msg_titre_mail = get_option('msg_titre_mail_' . $cle_langue);
                                            $msg_avant_pied_mail = get_option('msg_avant_pied_mail_' . $cle_langue);
                                            $msg_pied_mail = get_option('msg_pied_mail_' . $cle_langue);
                                            $insc_msg_titre_mail = get_option('insc_msg_titre_mail_' . $cle_langue);
                                            $insc_msg_mail = get_option('insc_msg_mail_' . $cle_langue);
                                            $msg_popa_reservation = get_option('msg_popa_reservation_' . $cle_langue);



                                            $msg_virement_bc = stripslashes($msg_virement_bc);
                                            $msg_mandat_cash = stripslashes($msg_mandat_cash);
                                            $msg_bonjour = stripslashes($msg_bonjour);
                                            $msg_titre_mail = stripslashes($msg_titre_mail);
                                            $msg_avant_pied_mail = stripslashes($msg_avant_pied_mail);
                                            $msg_pied_mail = stripslashes($msg_pied_mail);
                                            $insc_msg_titre_mail = stripslashes($insc_msg_titre_mail);
                                            $insc_msg_mail = stripslashes($insc_msg_mail);
                                            $msg_popa_reservation = stripslashes($msg_popa_reservation);


                                        ?>















                                            <div id="div_li_la_<?php echo $cle_langue; ?>" class="cont_langue_opa" style="<?php echo $cls_active; ?>">

                                                <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                                    <h3 class="et-pb-option-toggle-title"><strong>[<?php echo $cle_langue; ?>]</strong> Email de confirmation de réservation</h3>

                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Titre du mail: </label>
                                                        <?php wp_editor($msg_titre_mail, 'msg_titre_mail_' . $cle_langue, $settingss_o); ?>
                                                    </div>

                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Prise en compte de la réservation: </label>
                                                        <?php wp_editor($msg_bonjour, 'msg_bonjour_' . $cle_langue, $settingss_o); ?>
                                                    </div>

                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Virement bancaire: </label>
                                                        <?php wp_editor($msg_virement_bc, 'msg_virement_bc_' . $cle_langue, $settingss_o); ?>
                                                    </div>

                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Mandat Cash: </label>
                                                        <?php wp_editor($msg_mandat_cash, 'msg_mandat_cash_' . $cle_langue, $settingss_o); ?>
                                                    </div>

                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Avant le pied du mail: </label>
                                                        <?php wp_editor($msg_avant_pied_mail, 'msg_avant_pied_mail_' . $cle_langue, $settingss_o); ?>
                                                    </div>

                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Pied du mail: </label>
                                                        <?php wp_editor($msg_pied_mail, 'msg_pied_mail_' . $cle_langue, $settingss_o); ?>
                                                    </div>

                                                </div>

                                                <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                                    <h3 class="et-pb-option-toggle-title"><strong>[<?php echo $cle_langue; ?>]</strong> Email - Nouvelle inscription sur le site</h3>
                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Titre du mail: </label>
                                                        <?php wp_editor($insc_msg_titre_mail, 'insc_msg_titre_mail_' . $cle_langue, $settingss_o); ?>
                                                    </div>

                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Message du mail: </label>
                                                        <?php wp_editor($insc_msg_mail, 'insc_msg_mail_' . $cle_langue, $settingss_o); ?>
                                                    </div>
                                                </div>

                                                <div class="et-pb-options-toggle-container et-pb-options-toggle-disabled">
                                                    <h3 class="et-pb-option-toggle-title"><strong>[<?php echo $cle_langue; ?>]</strong> Message après une demande de réservation</h3>
                                                    <div class="et-pb-option et-pb-option--text">
                                                        <label><strong>[<?php echo $cle_langue; ?>]</strong> Fenêtre pop up: </label>
                                                        <?php wp_editor($msg_popa_reservation, 'msg_popa_reservation_' . $cle_langue, $settingss_o); ?>
                                                    </div>
                                                </div>


                                            </div>
                                        <?php $nbre_langue++;
                                        endforeach; ?>




                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div>
            <input type="submit" class="btn btn-success" name="save" value="Mettre à jour" />
            <input type="hidden" name="action" value="update" />
            <input type="hidden" name="update_settings" value="Y" />
        </div>

    </form>
<?php
}





function custom_menu_page_removing()
{
    if (! current_user_can('administrator')) {
        remove_menu_page('edit.php?post_type=project');
        remove_menu_page('edit.php?post_type=cours-actilangue');
        remove_menu_page('edit.php?post_type=reservation');
        remove_menu_page('edit.php?post_type=reservation_actilang');
        remove_menu_page('edit.php?post_type=logocarousel');

        remove_menu_page('index.php');                  //Dashboard
        remove_menu_page('jetpack');                    //Jetpack* 
        remove_menu_page('edit.php');                   //Posts
        remove_menu_page('upload.php');                 //Media
        remove_menu_page('edit.php?post_type=page');    //Pages
        remove_menu_page('edit-comments.php');          //Comments
        remove_menu_page('themes.php');                 //Appearance
        remove_menu_page('plugins.php');                //Plugins
        remove_menu_page('users.php');                  //Users
        remove_menu_page('tools.php');                  //Tools
        remove_menu_page('options-general.php');        //Settings

        remove_menu_page('index.php');
    }
}
add_action('admin_menu', 'custom_menu_page_removing');




add_action('admin_bar_menu', 'remove_wp_logo', 999);

function remove_wp_logo($wp_admin_bar)
{
    if (! current_user_can('administrator')) {
        $wp_admin_bar->remove_node('comments');
        $wp_admin_bar->remove_node('new-content');
        $wp_admin_bar->remove_node('languages');
    }
}


function remove_dashboard_widgets()
{
    if (! current_user_can('administrator')) {
        global $wp_meta_boxes;
        remove_meta_box('dashboard_activity', 'dashboard', 'side');
        remove_meta_box('dashboard_activity', 'dashboard', 'normal');

        unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_quick_press']); // Removes QuickPress
        unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_incoming_links']); // Incoming Links
        unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_right_now']); // Removes Right Now
        unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_plugins']); // Removes Plugins
        unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_recent_drafts']); // Removes Recent Drafts
        unset($wp_meta_boxes['dashboard']['normal']['core']['dashboard_recent_comments']); // Removes Recent Comments
        unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_primary']); // Removes the WordPress Developer Blog
        unset($wp_meta_boxes['dashboard']['side']['core']['dashboard_secondary']); // Removes the WordPress Blog Updates
    }
}
add_action('wp_dashboard_setup', 'remove_dashboard_widgets');





function admin_default_page()
{
    if (! current_user_can('administrator')) {
        global $polylang;
        $curr_lang = pll_current_language();
        $id_PAGE_FR = 1576;
        $translationIds = $polylang->model->get_translations('post', $id_PAGE_FR);
        $id_page_translated = pll_get_post($id_PAGE_FR, pll_current_language());



        return get_permalink($id_page_translated);
    }
    return home_url();
}

add_filter('login_redirect', 'admin_default_page');


function refresh_sha_bnp_paribasAjax()
{

    $assoc_to_transa = array(
        "current_wp_course_ID" => $_POST['current_wp_course_ID'],
        "current_sej_DEBUT" => $_POST['current_sej_DEBUT'],
        "current_sej_FIN" => $_POST['current_sej_FIN'],
        "current_SimuDate" => $_POST['current_SimuDate'],
        "id_current_course_ACTI" => $_POST['id_current_course_ACTI'],
        "current_courseDuration" => $_POST['current_courseDuration'],
        "current_coursePrice" => $_POST['current_coursePrice'],
        "current_Logement" => $_POST['current_Logement'],

        "genre-acti" => $_POST['genre-acti'],
        "nom-acti" => $_POST['nom-acti'],
        "prenom-acti" => $_POST['prenom-acti'],
        "nationalite-acti" => $_POST['nationalite-acti'],
        "date-naissance-acti" => $_POST['date-naissance-acti'],
        "profession-acti" => $_POST['profession-acti'],
        "adresse-1-acti" => $_POST['adresse-1-acti'],
        "adresse-2-acti" => $_POST['adresse-2-acti'],
        "code-postal-acti" => $_POST['code-postal-acti'],
        "ville-acti" => $_POST['ville-acti'],
        "pays-acti" => $_POST['pays-acti'],
        "phone-acti" => $_POST['phone-acti'],
        "fax-acti" => $_POST['fax-acti'],
        "acti_form_email" => $_POST['email_acti'],
        "note-acti" => $_POST['note-acti'],
        "logement-acti" => $_POST['logement-acti'],
        "single-logement-acti" => (string)$_POST['single-logement-acti'],
        "demi-pension-logement-acti" => (string)$_POST['demi-pension-logement-acti'],
        "petit-dejeuner-acti" => (string)$_POST['petit-dejeuner-acti'],
        "date-heure-arrivee-logement-acti" => $_POST['date-heure-arrivee-logement-acti'],
        "date-heure-depart-logement-acti" => $_POST['date-heure-depart-logement-acti'],
        "transferts-logement-acti" => $_POST['transferts-logement-acti'],
        "num-vol-train-logement-acti" => (string)$_POST['num-vol-train-logement-acti'],
        "niveau-en-langue-francaise-acti" => $_POST['niveau-en-langue-francaise-acti'],
        "message-acti" => $_POST['message-acti'],
        "methode_de_payement" => $_POST['methode_de_payement'],
        "gen_course_detail" => $_POST['gen_course_detail'],
        "current_SimuCodePromo" => $_POST['current_SimuCodePromo'],
        "current_SimuDELF" => $_POST['current_SimuDELF']
    );



    /***************************
     *
     * BEGIN: BNP PARIBAS INIT
     *
     */


    global $polylang;
    /*****************
     * Page Fr Registration ID
     */
    $curr_lang = pll_current_language();
    $id_PAGE_FR = 1191;
    $translationIds = $polylang->model->get_translations('post', $id_PAGE_FR);
    $id_page_inscription_translated = pll_get_post($id_PAGE_FR, pll_current_language());


    $id_PAGE_ACCOUNT = 1576;
    $translation_account_Ids = $polylang->model->get_translations('post', $id_PAGE_ACCOUNT);
    $id_page_compte = pll_get_post($id_PAGE_ACCOUNT, pll_current_language());





    $bnp_paribas_cle_secrete = get_option('bnp_paribas_cle_secrete');
    $bnp_paribas_version_cle = get_option('bnp_paribas_version_cle');

    $bnp_paribas_merchant_id = get_option('bnp_paribas_merchant_id');
    $bnp_paribas_mode = get_option('bnp_paribas_mode');

    // Initialisation de la classe Mercanet avec passage en parametre de la cle secrete
    $paymentRequest = new Mercanet($bnp_paribas_cle_secrete);

    // Indiquer quelle page de paiement appeler : TEST ou PRODUCTION 
    if ($bnp_paribas_mode == 'sandbox') {
        $paymentRequest->setUrl(Mercanet::TEST);
    } else {
        $paymentRequest->setUrl(Mercanet::PRODUCTION);
    }

    // Renseigner les parametres obligatoires pour l'appel de la page de paiement 
    $paymentRequest->setMerchantId($bnp_paribas_merchant_id);
    $paymentRequest->setKeyVersion($bnp_paribas_version_cle); /*1 ou 2 ou 3*/


    $la_reference_tansa = "actilanguebnp" . rand(100000, 999999);
    $paymentRequest->setTransactionReference($la_reference_tansa);

    //clé + valeur
    update_option($la_reference_tansa, $assoc_to_transa);
    //update_option( 'tempa_var', $assoc_to_transa );


    $paymentRequest->setAmount((int)(Reservation::$prix_acompte * 100));

    $paymentRequest->setCurrency('EUR');
    if (empty($_SERVER["HTTPS"])) {
        $http = "http://";
    } else {
        $http = "https://";
    }

    $urlReturn = get_permalink($id_page_compte);
    $urlReturnAuto = get_permalink($id_page_inscription_translated) . '?bnp-return=auto';

    $paymentRequest->setAutomaticResponseUrl($urlReturnAuto);
    $paymentRequest->setNormalReturnUrl($urlReturn);

    // Renseigner les parametres facultatifs pour l'appel de la page de paiement 
    $paymentRequest->setLanguage($curr_lang);

    // Verification de la validite des parametres renseignes    
    $paymentRequest->validate();

    /***************************
     *
     * END: BNP PARIBAS INIT
     *
     */

    /*
<div style="height: 0; widh: 0; overflow: hidden; z-index: -1; opacity: 0; position: absolute;">
		<form id="form_for_bnp_paribas" name="redirectForm" method="POST" action="'.$paymentRequest->getUrl().'">
			<input type="hidden" id="Data" name="Data" value="'.$paymentRequest->toParameterString().'" />
			<input type="hidden" id="InterfaceVersion" name="InterfaceVersion" value="'.Mercanet::INTERFACE_VERSION.'" />
			<input type="hidden" id="Seal" name="Seal" value="'.$paymentRequest->getShaSign().'" />			
		</form>
	</div>
*/

    $response = array();

    $response['action'] = $paymentRequest->getUrl();
    $response['Data'] = $paymentRequest->toParameterString();
    $response['InterfaceVersion'] = Mercanet::INTERFACE_VERSION;
    $response['Seal'] = $paymentRequest->getShaSign();

    $response = json_encode($response);
    echo $response;
    die();
}
add_action('wp_ajax_refresh_sha_bnp_paribasAjax', 'refresh_sha_bnp_paribasAjax');
add_action('wp_ajax_nopriv_refresh_sha_bnp_paribasAjax', 'refresh_sha_bnp_paribasAjax');



function cours_actilangue_columns($columns)
{
    $title = $columns['title'];





    $date = $columns['date'];


    unset($columns['title']);
    unset($columns['date']);


    $columns['title'] = $title;
    $columns['description_courte_cours'] = 'Courte description';
    $columns['date'] = $date;




    return $columns;
}
add_filter('manage_edit-cours-actilangue_columns', 'cours_actilangue_columns');


function cours_actilangue_column($nom_colonne, $id_champ)
{
    if ($nom_colonne == 'description_courte_cours') {
        $description_courte_cours = get_post_meta($id_champ, 'description_courte_cours', true);
        echo $description_courte_cours;
    }
}

add_action('manage_cours-actilangue_posts_custom_column', 'cours_actilangue_column', 10, 2);

function reservation_actilang_columns($columns)
{
    $title = $columns['title'];
    $res_transaction_id = $columns['res_transaction_id'];
    $extrait = $columns['extrait'];



    $author = $columns['author'];
    $date = $columns['date'];
    $eleve = $columns['eleve'];

    unset($columns['title']);
    unset($columns['author']);
    unset($columns['date']);


    $columns['title'] = $title;

    $columns['extrait'] = 'Description';
    $columns['promotion'] = 'Promotion';
    $columns['delf'] = 'DELF';
    $columns['eleve'] = 'Elève';

    $columns['methode_de_payement'] = 'Méthode de paiement';
    $columns['res_transaction_id'] = 'Identifiant du paiement';
    $columns['etat_reservation'] = 'Etat';


    $columns['date'] = $date;




    return $columns;
}
add_filter('manage_edit-reservation_actilang_columns', 'reservation_actilang_columns');

function reservation_actilang_column($nom_colonne, $id_champ)
{


    if ($nom_colonne == 'eleve') {
        $a_lister = array('genre-acti', 'prenom-acti', 'nom-acti', 'nationalite-acti', 'phone-acti', 'email_acti');
        $user_data_acti = get_post_meta((int)$id_champ, 'user_data_acti', true);



        foreach (Reservation::formulaire() as $fields_group):
            foreach ($fields_group["grp-fields"] as $field):
                if ($field['slug'] == 'email_acti') {
                    echo $user_data_acti['acti_form_email'] . '<br />';
                } else {
                    if (in_array($field['slug'], $a_lister)) {
                        echo $user_data_acti[$field['slug']] . '<br />';
                    }
                }

            endforeach;
        endforeach;
    }

    if ($nom_colonne == 'extrait') {
        $posita = get_post((int)$id_champ);
        echo $posita->post_content;

        $val_promotion = get_post_meta($id_champ, 'val_promotion', true);
        $user_data_acti = get_post_meta($id_champ, 'user_data_acti', true);
        $meta_current_coursePrice = $user_data_acti['current_coursePrice'];


        $val_prom_percent = ((float)$val_promotion / 100);
        $val_prom_price = $meta_current_coursePrice * $val_prom_percent;
        $finale_price_promo = $meta_current_coursePrice - $val_prom_price;

        echo '<p>Promotion: ' . $val_promotion . '<br />';
        echo '<strong>Coût total:</strong> ' . $finale_price_promo . ' &euro;</p>';
    }



    if ($nom_colonne == 'delf') {



        $val_delf = get_post_meta($id_champ, 'val_delf', true);
        /*echo $val_delf;*/
        $user_data_acti = get_post_meta($id_champ, 'user_data_acti', true);

        /*
		?>
			<pre>
				<?php print_r( $user_data_acti['delf-acti'] ); ?>
			</pre>
		<?php*/

        echo Reservation::yesNo()[(int)$user_data_acti['delf-acti']];
    }




    if ($nom_colonne == 'methode_de_payement') {
        $methode_de_payement = get_post_meta($id_champ, 'methode_de_payement', true);

        if ($methode_de_payement == 'cb') {
            echo 'Paypal ';
            echo '(<i>' . Reservation::pay_methods()['lists'][$methode_de_payement] . '</i>)';
        } else {
            echo Reservation::pay_methods()['lists'][$methode_de_payement];
        }
    }

    if ($nom_colonne == 'res_transaction_id') {
        $res_transaction_id = get_post_meta($id_champ, 'res_transaction_id', true);
        echo $res_transaction_id;
    }


    if ($nom_colonne == 'etat_reservation') {
        $etat_reservation = get_post_meta($id_champ, 'etat_reservation', true);

        if (Reservation::lbl_etat_reservation()[$etat_reservation]) {
            echo Reservation::lbl_etat_reservation()[$etat_reservation];
        }
    }

    if ($nom_colonne == 'debut_sejour') {
        $debut_sejour = get_post_meta($id_champ, 'debut_sejour', true);
        echo $debut_sejour;
    }
    if ($nom_colonne == 'fin_sejour') {
        $fin_sejour = get_post_meta($id_champ, 'fin_sejour', true);
        echo $fin_sejour;
    }
}

add_action('manage_reservation_actilang_posts_custom_column', 'reservation_actilang_column', 10, 2);


function wrap_form_func($atts = [], $content = null)
{

    $content = do_shortcode($content);

    $html = '';
    $html .= '<div class="wrap_cf_seven_acti ' . $atts['class'] . '"><div class="in_wrap_cf_seven_acti">

	<div style="display: none;" class="wrap_msg_errora">
		  <div class="in_wrap_msg_errora">
		    <div class="terne_wrap_msg_errora">
		      <div class="titre_msga_era">' . __('Des erreurs ont été trouvées dans votre formulaire', 'acti') . '</div>
		      <div class="wrapauloa">
		        <ul>
		        </ul>
		      </div>
		    </div>  
		  </div>
		</div>
	';
    $html .= $content;
    $html .= '</div></div>';

    return $html;
}

function one_champ_func($atts = [], $content = null)
{

    $content = do_shortcode($content);

    $html = '';
    $html .= '<div class="wrap_champa ' . $atts['class'] . '"><div class="in_wrap_champa">

	

	';
    $html .= $content;
    $html .= '</div></div>';

    return $html;
}

/*
* run shortcode in cf7
*/
add_filter('wpcf7_form_elements', 'decustom_wpcf7_form_elements');
function decustom_wpcf7_form_elements($form)
{
    $form = do_shortcode($form);
    return $form;
}



function a_shortcode_cus()
{
    if (!is_admin()) {
        add_shortcode('calendrier', 'calendrier_acti_func');

        add_shortcode('booking_header', 'booking_header_func');
        add_shortcode('booking_form', 'booking_forma_func');
        add_shortcode('booking_recap', 'booking_recap_func');
        add_shortcode('debut_cours', 'debut_cours_func');
        add_shortcode('actilangue_TITRE_DESCRIPTIF', 'titre_descriptif_func');
        add_shortcode('actilangue_DESCRIPTION_COURTE', 'acti_description_courte_func');
        add_shortcode('reservation_table', 'mon_compte_table_func');

        add_shortcode('wrap_form', 'wrap_form_func');
        add_shortcode('one_champ', 'one_champ_func');
        add_shortcode('btn_lien', 'btn_lien_func');
    }
}

add_action('init', 'a_shortcode_cus');
