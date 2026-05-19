"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";

const firstNames = [
  "Nina", "Kameron", "Karsyn", "Benjamin", "Ellen", "Bode", "Araceli", "Colt",
  "Kimber", "Langston", "Harmony", "Erick", "Aila", "Hunter", "Paloma", "Finn",
  "Cadence", "Ares", "Leah", "Kyle", "Adelynn", "Jamal", "Estella", "Louie",
  "Guadalupe", "Carmelo", "Melissa", "Kalel", "Jaelynn", "Harry", "Vivienne", "Elijah",
  "Janelle", "Easton", "Egypt", "Ander", "Oakleigh", "Kian", "Megan", "Gage",
  "Cecilia", "Bennett", "Maisie", "Zayn", "Belen", "Rhys", "Adalynn", "Amos",
  "Cora", "Kye", "Mila", "Khalid", "Mallory", "Liam", "April", "Harley",
  "Allison", "Tripp", "Catalina", "Vicente", "Lana", "Heath", "Cameron", "Remington",
  "Nathalie", "Wesley", "Aleena", "Archie", "Daniella", "Major", "Crystal", "Armani",
  "Ellie", "Micah", "Emily", "Ivan", "Loretta", "Mohammed", "Alana", "Hugo",
  "Selah", "Dax", "Autumn", "Andrew", "Madalyn", "Otis", "Aubrey", "Lorenzo",
  "Ensley", "Westin", "Korbin", "Briella", "Aryan", "Halle", "Samuel", "Mara",
  "Junior", "Dalary", "Brendan", "Nicole", "Gerald", "Sasha", "Maddox", "Noor",
  "Louis", "Raelyn", "Nehemiah", "Londyn", "Mccoy", "Abner", "Whitley", "Bradley",
  "Amayah", "Alonso", "Camilla", "Shiloh", "Lauren", "Zachary", "Eden", "Corbin",
  "Mya", "Ashton", "Jordyn", "Aspyn", "Forest", "Aurelia", "Jaxxon", "Jazlyn",
  "Israel", "Margo", "Asa", "Della", "Moses", "Tatum", "Hugh", "Sofia",
  "Jenesis", "Riley", "June", "Stetson", "Esmeralda", "Zane", "Blake", "Abdiel",
  "Alayah", "Foster", "Lily", "Tadeo", "Ava", "Mack", "Martin", "Ariella",
  "Will", "Meilani", "Carter", "Madeline", "Adam", "Greta", "Camden", "Itzel",
  "Walter", "Renata", "Rudy", "Persephone", "Trevor", "Kamryn", "Thiago", "Mazikee",
  "Kingsley", "Lucia", "Dayton", "Margaret", "Esteban", "Ivanna", "Robert", "Sophia",
  "Avery", "Amira", "Bryson", "Marina", "Hector", "Harleigh", "Ramon", "Landon",
  "Skye", "Weston", "Angelica", "Dante", "Giana", "Keenan", "Zoya", "Julien",
  "Kendra", "Kaiden", "Jaylin", "Cayden", "Laylani", "Lane", "Bria", "Ayden",
  "Blakely", "Angelo", "Barbara", "Eliel", "Naya", "Valentino", "Khaleesi", "Axel",
  "Annalise", "Luka", "Jordan", "Joseph", "Lucille", "Kenzo", "Nyomi", "Isaias",
  "Makenzie", "Niklaus", "Anastasia", "Quincy", "Carly", "Raiden", "Reese", "Axton",
  "Kennedi", "Amari", "Ahmad", "Etta", "Hayden", "Lucy", "Casen", "Malaya",
  "Reece", "Florence", "Kyro", "Khalani", "Fox", "Kaia", "Reign", "Maleah",
  "Blaine", "Colby", "Miriam", "Peyton", "Macie", "Itzayana", "Maximiliano", "Dallas",
  "Memphis", "Marisol", "Reed", "Sunny", "Dominik", "Berkley", "Paola", "Westley",
  "Astrid", "Cataleya", "Phoenix", "Sky", "Atticus", "Eve", "Wilson", "Marco",
  "Maia", "Alaric", "Paisley", "Callahan", "Paityn", "Dalton", "Maeve", "Harrison",
  "Edgar", "Lillie", "Niko", "Shelby", "Jacoby", "Zara", "Francisco", "Leila",
  "Emilia", "Alessandro", "Cara", "Luciano", "Savannah", "Dani", "Rodney", "Davina",
  "Tanner", "Josie", "Skyler", "Leyla", "Moises", "Lacey", "Greyson", "Delaney",
  "Tomas", "Athena", "Leighton", "Theodora", "Emerson", "Hazel", "Dylan", "Kyson",
  "Angela", "Fisher", "Kellen", "Kaliyah", "Mitchell", "Makayla", "Moshe", "Ayleen",
  "Meredith", "Andres", "Natalie", "Mason", "Octavia", "Reid", "Adeline", "Zyaire",
  "Isabella", "Aziel", "Celeste", "Callen", "Piper", "Waylon", "Lilianna", "Mauricio",
  "Benicio", "Malia", "Eliseo", "Harper", "Laurel", "Augustus", "Madilyn", "Banks",
  "Amirah", "Bjorn", "Rex", "Zariah", "Jaziel", "Amy", "Quinton", "Kaisley",
  "Nayeli", "Milani", "Ibrahim", "Stevie", "Zev", "Brinley", "Rhett", "Angel",
  "Beckham", "Briana", "Jamir", "Arianna", "Ellis", "Lydia", "Branson", "Aleah",
  "Carson", "Connor", "Avah", "Holland", "Maximilian", "Zariyah", "Leonel", "Marilyn",
  "Mathew", "Zainab", "Muhammad", "Regina", "Alivia", "Malakai", "Callie", "Everest",
  "Ainhoa", "Zaylee", "Spencer", "Alyssa", "Jase", "Zeke", "Adelaide", "Samantha",
  "Drake", "Jade", "Eva", "Cairo", "Estrella", "Jolene", "Matthew", "Zoey",
  "Fabian", "Amelie", "Yusuf", "Santana", "Zola", "Cohen", "Mariah", "Colton",
  "Ryan", "Alison", "Benson", "Titus", "Kristian", "Elise", "Ivory", "Ocean",
  "Dillon", "Tiana", "Heidi", "Clayton", "Ariyah", "Ambrose", "Kinslee", "Frederick",
  "Selene", "Hailey", "Samson", "Braelyn", "Jameson", "Corey", "Liana", "Brixton",
  "Melody", "Wesson", "Jovie", "Kashton", "Alaina", "Beau", "Abby", "Nellie",
  "Kasen", "Yamileth", "Kai", "Robin", "Jason", "Seven", "Alexis", "Aniyah",
  "Wayne", "Estelle", "Brynn", "Trace", "Davion", "Scout", "Alicia", "Jefferson",
  "Aislinn", "Jasiah", "Lina", "Kolton", "Elsie", "Maison", "Treasure", "Briar",
  "Michelle", "Simon", "Mohamed", "Jayleen", "Allen", "Curtis", "Josephine", "Sergio",
  "Paulina", "Deacon", "Dahlia", "Sylvia", "Grant", "Myla", "Aitana", "Stephanie",
  "Aldo", "Kiana", "Kyng", "Dorian", "Noah", "Charlotte", "Marley", "Serena",
  "Ashlynn", "Santos", "Valentina", "Dario", "Kamilah", "Valentin", "Stormi", "Malachi",
  "Aarya", "Cruz", "Gracie", "Ashley", "Madisyn", "Dustin", "Eloise", "Dane",
  "Gabrielle", "Luella", "Felipe", "Novah", "Pearl", "Griffin", "Gwen", "Thatcher",
  "Adaline", "Anakin", "Bentlee", "Clare", "Osiris", "Zora", "Clementine", "Jake",
  "Noemi", "Silas", "Nyla", "Ameer", "Jenna", "Devon", "Kaiser", "Cyrus",
  "Franklin", "Julianna", "Kayson", "Ricky", "Wrenley", "Cillian", "Maggie", "Kole",
  "Annabelle", "Caiden", "Mekhi", "Amaya", "Malcolm", "Ryder", "Laura", "Ronin",
  "Winston", "Henley", "Arlo", "Felicity", "Roger", "Gavin", "Tyler", "Lauryn",
  "Conner", "Alan", "Saylor", "Darwin", "Alena", "Bryce", "Ray", "Rayden",
  "Bexley", "Gwendolyn", "Jagger", "Presley", "Solomon", "Adriel", "Houston", "Kensley",
  "Maxton", "Jane", "Trey", "Simone", "Legacy", "Lincoln", "Amora", "Kamari",
  "Galilea", "Kayden", "Rivka", "Wiggins", "Capri", "Stetson", "Hassan", "Penny",
  "Madden", "Kyler", "Xiomara", "Korbyn", "Alma", "Allan", "Katalina", "Teresa",
  "Barrett", "Denver", "Julio", "Orlando", "Porter", "Jocelyn", "Dean", "Callum",
  "Liv", "Mekhi", "Kaylie", "Jones", "Marlee", "Emerson", "Neil", "Maxine",
  "Leonardo", "Ivy", "Kannon", "Maya", "Boden", "Melani", "Cesar", "Aisha",
  "Demetrius", "Lexie", "Andy", "Kaylani", "Baker", "Frances", "Braxton", "Waverly",
  "Alvaro", "Emerald", "Iker", "Grady", "Sonny", "Edison", "Bristol", "Aarav",
  "Emmie", "Soren", "Reina", "Cheyenne", "Tobias", "Brylee", "Kadence", "Bryant",
  "Nataly", "Adrian", "Celine", "Jonas", "Bridget", "Daniel", "Lia", "Ernesto",
  "Brodie", "Shay", "Trenton", "Ainsley", "Sean", "Hallie", "Marlon", "Aubree",
  "Ellison", "Rowen", "Calvin", "Cooper", "Aspen", "Enoch", "Olivia", "Alden",
  "Scarlett", "Prince", "Fernanda", "Abram", "Kyrie", "Marianna", "Elianna", "Declan",
  "Thalia", "Meadow", "Gatlin", "Siena", "Noelle", "Tony", "Nalani", "Ismael",
  "Kinley", "Layne", "Kayleigh", "Axl", "Bianca", "Jacob", "Mack", "Emmalyn",
  "Terry", "Adelyn", "Yara", "Juan", "Lexi", "Abigail", "Caleb", "Skyla",
  "Mylo", "Karina", "Zainab", "Stephen", "Aniya", "Juliana", "Caden", "Nola",
  "Brinley", "Lim", "Giavanna", "Ari", "Genesis", "Kylian", "Eugene", "Katherine",
  "Koa", "Averie", "Matthias", "Sullivan", "Veronica", "Emani", "Giuliana", "Turner",
  "Kaydence", "Gunner", "Laila", "Natalia", "Evangeline", "Rebecca", "Rayan", "Holden",
  "Kairo", "Rory", "Tru", "Valery", "Elaina", "Wes", "Laylah", "Leland",
  "Tessa", "Finnegan", "Hamza", "Mikaela", "Lawson", "Sienna", "Nala", "James",
  "Kairi", "Ayan", "Alvin", "Alberto", "Marcel", "Kiaan", "Andrea", "Marcellus",
  "Zayd", "Alejandro", "Kennedy"
];

const countries = [
  "United States", "United Kingdom", "Germany", "France", "Canada", "Australia",
  "Japan", "South Korea", "China", "India", "Brazil", "Mexico", "Spain", "Italy",
  "Netherlands", "Switzerland", "Singapore", "UAE", "Saudi Arabia", "Russia",
  "South Africa", "Egypt", "Turkey", "Poland", "Sweden", "Norway", "Denmark",
  "Finland", "Ireland", "Austria", "Belgium", "Portugal", "Greece", "Czech Republic",
  "Romania", "Hungary", "Croatia", "Slovakia", "Slovenia", "Bulgaria", "Serbia",
  "Lithuania", "Latvia", "Estonia", "Iceland", "Luxembourg", "Malta", "Cyprus",
  "New Zealand", "Philippines", "Thailand", "Vietnam", "Indonesia", "Malaysia",
  "Taiwan", "Hong Kong", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal",
  "Myanmar", "Cambodia", "Laos", "Mongolia", "Kazakhstan", "Uzbekistan",
  "Azerbaijan", "Georgia", "Armenia", "Israel", "Jordan", "Lebanon", "Iraq",
  "Kuwait", "Qatar", "Bahrain", "Oman", "Yemen", "Iran", "Afghanistan",
  "Nigeria", "Kenya", "Ghana", "Ethiopia", "Tanzania", "Uganda", "Cameroon",
  "Ivory Coast", "Senegal", "Mali", "Mozambique", "Madagascar", "Angola",
  "Zambia", "Zimbabwe", "Botswana", "Namibia", "Rwanda", "Tunisia", "Morocco",
  "Algeria", "Libya", "Sudan", "Somalia", "DR Congo", "Gabon", "Mauritius",
  "Argentina", "Colombia", "Chile", "Peru", "Venezuela", "Ecuador", "Bolivia",
  "Paraguay", "Uruguay", "Costa Rica", "Panama", "Guatemala", "Honduras",
  "El Salvador", "Nicaragua", "Dominican Republic", "Cuba", "Jamaica",
  "Trinidad and Tobago", "Haiti", "Barbados", "Bahamas", "Bermuda", "Suriname",
  "Guyana", "Belize", "Puerto Rico", "Ukraine", "Belarus", "Moldova",
  "North Macedonia", "Albania", "Montenegro", "Bosnia", "Kosovo",
  "Liechtenstein", "Monaco", "Andorra", "San Marino", "Vatican City",
  "Fiji", "Papua New Guinea", "Samoa", "Tonga", "Solomon Islands",
  "Brunei", "Maldives", "Bhutan", "Timor-Leste", "Seychelles",
  "Cape Verde", "Comoros", "Djibouti", "Eritrea", "Eswatini", "Lesotho",
  "Liberia", "Sierra Leone", "Togo", "Benin", "Burkina Faso", "Guinea",
  "Chad", "Niger", "Central African Republic", "Republic of Congo",
  "Equatorial Guinea", "São Tomé", "Gambia", "Guinea-Bissau", "Mauritania",
  "South Sudan", "Malawi", "Burundi", "Réunion", "Mayotte", "Curaçao",
  "Aruba", "Cayman Islands", "Turks and Caicos", "Gibraltar", "Greenland",
  "Faroe Islands", "Guam", "US Virgin Islands", "Macau"
];

const actions = [
  { text: "just traded", icon: BarChart3, color: "text-primary" },
  { text: "just made profit of", icon: TrendingUp, color: "text-success" },
  { text: "just withdrawn", icon: DollarSign, color: "text-primary" },
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomAmount(): string {
  const amount = Math.floor(Math.random() * (78000 - 560) + 560);
  return amount.toLocaleString("en-US");
}

function generateNotification() {
  const firstName = getRandomElement(firstNames);
  const country = getRandomElement(countries);
  const action = getRandomElement(actions);
  const amount = getRandomAmount();
  
  return {
    id: Date.now(),
    firstName,
    country,
    action,
    amount,
  };
}

export function TradeNotifications() {
  const [notification, setNotification] = useState<ReturnType<typeof generateNotification> | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Clear all timeouts
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  // Add timeout to refs for cleanup
  const addTimeout = (callback: () => void, delay: number) => {
    const id = setTimeout(callback, delay);
    timeoutRefs.current.push(id);
    return id;
  };

  useEffect(() => {
    setMounted(true);
    
    // Initial delay before first notification
    addTimeout(() => {
      showNotification();
    }, 3000);

    return () => {
      clearAllTimeouts();
    };
  }, []);

  const showNotification = () => {
    const newNotification = generateNotification();
    setNotification(newNotification);
    setIsVisible(true);

    // Hide after 5 seconds
    addTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Schedule next notification (5-12 seconds interval)
    const nextDelay = 5000 + Math.floor(Math.random() * 7000) + 5000;
    addTimeout(() => {
      showNotification();
    }, nextDelay);
  };

  // Don't render on server
  if (!mounted) return null;

  return (
    <div className="fixed bottom-20 left-4 z-9998" suppressHydrationWarning>
      <AnimatePresence mode="wait">
        {isVisible && notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface/95 backdrop-blur-sm px-4 py-3 shadow-lg max-w-xs"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ${notification.action.color}`}>
              <notification.action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-text-primary leading-snug">
                <span className="font-semibold">{notification.firstName}</span>
                {" "}from{" "}
                <span className="font-medium">{notification.country}</span>
                {" "}{notification.action.text}{" "}
                <span className="font-semibold text-success">${notification.amount}</span>
              </p>
              <p className="text-xs text-text-muted mt-0.5">Just now</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
