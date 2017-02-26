<?php
    function jsonStringify($template_file_path){
        $htmlstr = "";
        ob_start();  // sending all response output to a buffer, and not to the client browser/system.
        include $template_file_path;
        $htmlstr = ob_get_clean(); // grabs the buffer as string, cleans the buffer, and stops response buffering.
        return json_encode ($htmlstr);
    }
?>