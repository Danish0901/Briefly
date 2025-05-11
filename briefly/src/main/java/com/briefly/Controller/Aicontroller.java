package com.briefly.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.briefly.Model.Airequest;
import com.briefly.Service.QnaService;



@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class Aicontroller {
    
    @Autowired
    QnaService qnaservice;

    @PostMapping("/summarize")
    public ResponseEntity<?> summarize(@RequestBody Airequest request){
        String result = qnaservice.processContent(request);
        return ResponseEntity.ok(result);
    }
}
