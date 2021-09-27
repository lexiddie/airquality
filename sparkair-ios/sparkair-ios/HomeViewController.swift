//
//  HomeViewController.swift
//  sparkair-ios
//
//  Created by Lex on 10/4/20.
//  Copyright © 2020 Lex. All rights reserved.
//

import UIKit
import Firebase
import ObjectMapper

class HomeViewController: UIViewController {
    
    private let particles = Database.database().reference().child("particles")
    
    @IBOutlet var mainProfile: UIImageView!
    @IBOutlet var airQualityLevelLabel: UILabel!
    @IBOutlet var pm25Label: UILabel!
    @IBOutlet var pm10Label: UILabel!

    override func viewDidLoad() {
        super.viewDidLoad()
        checkFirebaseData()
    }
    
    func checkFirebaseData() {
        particles.queryLimited(toLast: 1).observe(.value) { (DataSnapshot) in
            for child in DataSnapshot.children {
                let index = child as! DataSnapshot
                let value = index.value as! [String: Any]
                let particle = Mapper<Particle>().map(JSONObject: value)!
                self.pm10Label.text = "PM2.5: \(String(format:"%.02f", particle.pm10))"
                self.pm25Label.text = "PM10: \(String(format:"%.02f", particle.pm25))"
                let (imageLevel, airLevel)  = self.getAirLevelImage(airLevel: particle.pm25)
                self.mainProfile.image = imageLevel
                print(imageLevel)
                print(airLevel)
                self.airQualityLevelLabel.text = airLevel
                print(particle)
            }
        }
    }

    func getAirLevelImage(airLevel: Double) -> (UIImage, String) {
        if airLevel <= 50 {
            return (UIImage(named: "good")!, "Good")
        } else if airLevel <= 100 {
            return (UIImage(named: "moderate")!, "Moderate")
        } else if airLevel <= 200 {
            return (UIImage(named: "unhealthy")!, "Unhealthy")
        } else if airLevel <= 300 {
            return (UIImage(named: "veryunhealthy")!, "Very Unhealthy")
        } else {
            return (UIImage(named: "hazardous")!, "Hazardous")
        }
    }

}
