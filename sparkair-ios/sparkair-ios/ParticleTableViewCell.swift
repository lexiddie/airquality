//
//  ParticleTableViewCell.swift
//  sparkair-ios
//
//  Created by Lex on 10/4/20.
//  Copyright © 2020 Lex. All rights reserved.
//

import UIKit

class ParticleTableViewCell: UITableViewCell {

    @IBOutlet var airLevelImageView: UIImageView!
    @IBOutlet var airParticleLabel: UILabel!
    @IBOutlet var dateTimeLabel: UILabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
    }

}
