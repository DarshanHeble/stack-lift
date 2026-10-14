package com.example.legacy;

import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LegacyController {

    @GetMapping("/api/status")
    public String status(HttpServletRequest request) {
        return "Legacy Service Active from: " + request.getRemoteAddr();
    }
}
