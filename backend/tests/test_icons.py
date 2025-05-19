import pytest
from app.models.icons import get_animal_icon, IconPath

def test_bull_icon():
    """Test icono toro (imagen)"""
    icon = get_animal_icon(genere="M")
    assert icon.icon == IconPath.BULL
    assert icon.color == "black"
    assert icon.is_image == True

def test_nursing_cow_icon():
    """Test icono vaca amamantando (unicode)"""
    icon = get_animal_icon(genere="F", alletar=True)
    assert icon.icon == IconPath.COW_NURSING
    assert icon.color == "blue"
    assert icon.is_image == False

def test_not_nursing_cow_icon():
    """Test icono vaca sin amamantar"""
    icon = get_animal_icon(genere="F", alletar=False)
    assert icon.path == IconPath.COW_NOT_NURSING
    assert icon.color == "black"

def test_deceased_animal_icon():
    """Test icono animal fallecido"""
    icon = get_animal_icon(genere="M", estado="fallecido")
    assert icon.path == IconPath.DECEASED
    assert icon.color == "black"

def test_cow_state_change():
    """Test cambio de estado de vaca"""
    # Vaca amamantando
    icon1 = get_animal_icon(genere="F", alletar=True)
    assert icon1.path == IconPath.COW_NURSING
    assert icon1.color == "blue"
    
    # La misma vaca deja de amamantar
    icon2 = get_animal_icon(genere="F", alletar=False)
    assert icon2.path == IconPath.COW_NOT_NURSING
    assert icon2.color == "black"
    
    # La vaca fallece
    icon3 = get_animal_icon(genere="F", estado="fallecido")
    assert icon3.path == IconPath.DECEASED
    assert icon3.color == "black"