//
//  ParticleViewController.swift
//  sparkair-ios
//
//  Created by Lex on 10/4/20.
//  Copyright © 2020 Lex. All rights reserved.
//

import UIKit
import ObjectMapper
import Firebase

class ParticleViewController: UIViewController {
    
    @IBOutlet var tableView: UITableView!
    
    private let particlesFirebase = Database.database().reference().child("particles")

    var particles = [Particle]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        checkFirebaseData()
    }
    
    func checkFirebaseData() {
        self.particlesFirebase.observe(.value) { (DataSnapshot) in
            self.particles.removeAll()
            for child in DataSnapshot.children {
                let user = child as! DataSnapshot
                let check = user.value as! [String: Any]
                let particle = Mapper<Particle>().map(JSONObject: check)
                self.particles.append(particle!)
            }
            self.particles.reverse()
            self.tableView.reloadData()
            self.tableView.allowsSelection = false
        }
    }
    
    func getAirLevelImage(airLevel: Double) -> UIImage {
        if airLevel <= 50 {
            return UIImage(named: "good")!
        } else if airLevel <= 100 {
            return UIImage(named: "moderate")!
        } else if airLevel <= 200 {
            return UIImage(named: "unhealthy")!
        } else if airLevel <= 300 {
            return UIImage(named: "veryunhealthy")!
        } else {
            return UIImage(named: "hazardous")!
        }
    }
}

extension ParticleViewController: UITableViewDelegate, UITableViewDataSource {

    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 84
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return particles.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "particleCell", for: indexPath) as! ParticleTableViewCell
        
        cell.airParticleLabel.text = "PM 2.5: \(String(format:"%.02f", particles[indexPath.row].pm25)), PM 10: \(String(format:"%.02f", particles[indexPath.row].pm10))"
        cell.dateTimeLabel.text = particles[indexPath.row].dateTime
        
        cell.airLevelImageView.image = getAirLevelImage(airLevel: particles[indexPath.row].pm25)
        cell.selectionStyle = UITableViewCell.SelectionStyle.gray
        return cell
    }
}

