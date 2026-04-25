<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = $_POST;

    if (isset($input['_honey']) && !empty($input['_honey'])) {
        header("Location: ./?mail=spam#contact");
        exit;
    }

    $name = isset($input['name']) ? strip_tags(trim($input['name'])) : '';
    $email = isset($input['email']) ? filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL) : '';
    $phone = isset($input['phone']) ? strip_tags(trim($input['phone'])) : '';
    $message = isset($input['message']) ? trim($input['message']) : '';

    if (empty($name) || empty($email) || empty($message)) {
        header("Location: ./?mail=empty#contact");
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ./?mail=invalid#contact");
        exit;
    }

    if (!isset($input['antispam_token']) || $input['antispam_token'] !== 'brylantowy_palac_2026') {
        if (isset($_SERVER['HTTP_ACCEPT']) && (strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
            header('Content-Type: application/json', true, 403);
            echo json_encode(['status' => 'error', 'message' => 'Weryfikacja antyspamowa nie powiodła się.']);
            exit;
        }
        header("Location: ./?mail=spam#contact");
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 's141.cyber-folks.pl';
        $mail->SMTPAuth = true;
        $mail->Username = 'mailer@atlantiscode.dev';
        $mail->Password = '-LxnVC3PT-564WFm';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        $mail->CharSet = 'UTF-8';

        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        $mail->setFrom('mailer@atlantiscode.dev', 'Brylantowy Pałac - Kontakt');
        $mail->addAddress('brylantowypalac@gmail.com');
        $mail->addReplyTo($email, $name);

        $mail->isHTML(false);
        $mail->Subject = 'Nowa wiadomość od: ' . $name;
        $mail->Body = "Dane klienta:\nImię i nazwisko: $name\nEmail: $email\nTelefon: $phone\n\nWiadomość:\n$message\n";

        $mail->send();

        if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'success']);
            exit;
        }

        header("Location: ./?mail=success#contact");
    }
    catch (Exception $e) {
        error_log("Mailer Error: " . $mail->ErrorInfo);

        if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
            header('Content-Type: application/json', true, 500);
            echo json_encode(['status' => 'error', 'message' => $mail->ErrorInfo]);
            exit;
        }

        header("Location: ./?mail=error#contact");
    }
}
else {
    header("Location: ./");
}
?>
