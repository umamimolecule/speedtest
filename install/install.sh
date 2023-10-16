#! /bin/sh
OSTYPE="$(uname -s)"
installLocation="/home"
cd $installLocation
echo "Opening Install Location : \"$installLocation\""
if [ ! -d "LANSpeedTest" ]; then
    # Check if Git is needed
    if [ ! -x "$(command -v git)" ]; then
        # Check if Ubuntu
        if [ -x "$(command -v apt)" ]; then
            sudo apt update
            sudo apt install git -y
        else
            echo "OS not supported - exiting"
            exit 1
        fi
    fi
    # Check if wget is needed
    if [ ! -x "$(command -v wget)" ]; then
        # Check if Ubuntu
        if [ -x "$(command -v apt)" ]; then
            sudo apt install wget -y
        else
            echo "OS not supported - exiting"
            exit 1
        fi
    fi

    productName="LANSpeedTest"
    echo "Getting the Main Branch"
    branch='main'

    # Download from Git repository
    gitURL="https://github.com/umamimolecule/speedtest"
    sudo git clone $gitURL.git -b $branch LANSpeedTest
    # Enter LANSpeedTest folder "/home/LANSpeedTest"
    cd LANSpeedTest
    gitVersionNumber=$(git rev-parse HEAD)
    theDateRightNow=$(date)
    # write the version.json file for the main app to use
    sudo touch version.json
    sudo chmod 777 version.json
    sudo echo '{"Product" : "'"$productName"'" , "Branch" : "'"$branch"'" , "Version" : "'"$gitVersionNumber"'" , "Date" : "'"$theDateRightNow"'" , "Repository" : "'"$gitURL"'"}' > version.json
    echo "----------- LANSpeedTest ------------"
    echo "Repository : $gitURL"
    echo "Product : $productName"
    echo "Branch : $branch"
    echo "Version : $gitVersionNumber"
    echo "Date : $theDateRightNow"
    echo "-------------------------------------"
else
    echo "!-----------------------------------!"
    echo "LANSpeedTest already downloaded."
    exit 1
fi

# start the installer in the main app
echo "*-----------------------------------*"
sudo chmod +x install/ubuntu.sh
sudo install/ubuntu.sh
