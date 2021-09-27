//
//  Particle.swift
//  sparkair-ios
//
//  Created by Lex on 10/4/20.
//  Copyright © 2020 Lex. All rights reserved.
//

import UIKit
import ObjectMapper

class Particle: Mappable {
    
    var id: String! = ""
    var dateTime: String! = ""
    var pm25: Double! = 0.0
    var pm10: Double! = 0.0
    var healthLevel: String! = ""
    
    required init?(map: Map) { }
    
    func mapping(map: Map) {
        id <- map["id"]
        dateTime <- map["dateTime"]
        pm25 <- map["pm25"]
        pm10 <- map["pm10"]
    }
}

